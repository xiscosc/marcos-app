import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import {
	ConfigService,
	FileService,
	OrderAuditTrailService,
	OrderService,
	type ISameDayOrderCounters
} from '@marcsimolduressonsardina/core/service';
import {
	OrderAuditTrailType,
	OrderStatus,
	PaymentStatus,
	type AppUser,
	type FullOrder,
	type Order,
	type OrderAuditTrailEntry
} from '@marcsimolduressonsardina/core/type';
import { AuthService } from '$lib/server/service/auth.service';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	locationOrderSchema,
	promoteOrderSchema,
	statusOrderSchema
} from '$lib/shared/form-schema/order.form-schema';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

async function setOrderStatus(
	status: OrderStatus,
	params: RouteParams,
	locals: App.Locals,
	location?: string
): Promise<Order> {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;

	if (!appUser.priceManager && status === OrderStatus.DELETED) {
		throw fail(403, {});
	}

	const orderService = new OrderService(AuthService.generateConfiguration(appUser));

	const order = await orderService.getOrderById(id);
	if (!order) {
		throw fail(500, { missing: true });
	}

	if (
		status !== OrderStatus.FINISHED &&
		status !== OrderStatus.DELETED &&
		order.status === OrderStatus.QUOTE
	) {
		throw fail(400, { missing: true });
	}

	await orderService.setOrderStatus(order, status, location);
	await trackServerEvent(
		appUser,
		{
			event: 'order_status_changed',
			properties: { status, location },
			orderId: order.id
		},
		locals.posthog
	);
	return order;
}

async function loadData(
	user: AppUser,
	orderId: string
): Promise<{
	fullOrder: FullOrder | null;
	unfinishedSameDayCount: ISameDayOrderCounters;
	hasFiles: boolean;
	locations: string[];
	notificationEntries: OrderAuditTrailEntry[];
}> {
	const config = AuthService.generateConfiguration(user);
	const orderService = new OrderService(config);
	const configService = new ConfigService(config);
	const auditTrailService = new OrderAuditTrailService(config);
	const fileService = new FileService(config);
	const fullOrder = await orderService.getFullOrderById(orderId);
	const files = await fileService.getFilesByOrder(orderId);
	const locations = await configService.getLocationsList();
	const order = fullOrder?.order;
	const unfinishedSameDayCount = order
		? await orderService.getOrdersCountOnSameDay(order)
		: { finishedCount: 0, pendingCount: 0, totalCount: 1 };
	const notificationEntries = order?.notified
		? await auditTrailService.getEntriesForOrder(orderId, OrderAuditTrailType.NOTIFICATION)
		: [];
	return {
		fullOrder,
		hasFiles: files.length > 0,
		unfinishedSameDayCount,
		locations,
		notificationEntries
	};
}

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const promoteForm = await superValidate(zod(promoteOrderSchema), { id: 'promote-order-form' });
	const locationForm = await superValidate(zod(locationOrderSchema));
	const statusForm = await superValidate(zod(statusOrderSchema));

	const { id } = params;
	return {
		info: loadData(appUser, id),
		isPriceManager: appUser.priceManager,
		promoteForm,
		locationForm,
		statusForm
	};
}) satisfies PageServerLoad;

export const actions = {
	async deleteOrder({ params, locals }) {
		await setOrderStatus(OrderStatus.DELETED, params, locals);
		redirect(303, `/`);
	},
	async denote({ locals, params }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));

		const order = await orderService.getOrderById(id);
		if (!order || order.status === OrderStatus.QUOTE) {
			return fail(404, { missing: true });
		}

		await orderService.moveOrderToQuote(order);
		await trackServerEvent(
			appUser,
			{
				event: 'order_status_changed',
				properties: { status: OrderStatus.QUOTE },
				orderId: order.id
			},
			locals.posthog
		);
	},
	promote: async ({ request, locals, params }) => {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		const order = await orderService.getOrderById(id);
		if (!order || order.status !== OrderStatus.QUOTE) {
			return fail(404, { missing: true });
		}

		const form = await superValidate(request, zod(promoteOrderSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await orderService.moveQuoteToOrder(order, form.data.deliveryDate);
		await trackServerEvent(
			appUser,
			{
				event: 'order_status_changed',
				properties: { status: OrderStatus.PENDING },
				orderId: order.id
			},
			locals.posthog
		);

		return {
			form
		};
	},
	saveLocation: async ({ request, locals, params }) => {
		const form = await superValidate(request, zod(locationOrderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		await setOrderStatus(OrderStatus.FINISHED, params, locals, form.data.location);
		return {
			form
		};
	},
	async changeOrderStatus({ request, locals, params }) {
		const form = await superValidate(request, zod(statusOrderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const newStatus = form.data.status as OrderStatus;
		await setOrderStatus(newStatus, params, locals, form.data.location);
		return {
			form
		};
	},
	async changePayment({ request, locals, params }) {
		const formData = await request.formData();
		const newStatus = formData.get('paymentStatus') as PaymentStatus;
		const amount = formData.get('amount')?.toString();

		const appUser = await AuthUtilities.checkAuth(locals);
		const { id } = params;
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		const order = await orderService.getOrderById(id);
		if (!order) {
			return fail(500, { missing: true });
		}

		if (newStatus === PaymentStatus.FULLY_PAID) {
			await orderService.setOrderFullyPaid(order);
		}

		if (newStatus === PaymentStatus.UNPAID) {
			await orderService.setOrderPartiallyPaid(order, 0);
		}

		if (newStatus === PaymentStatus.PARTIALLY_PAID) {
			if (amount == null) {
				return fail(400, { missing: true });
			}
			const amountNumber = parseFloat(amount);
			if (isNaN(amountNumber) || amountNumber < 0) {
				return fail(400, { invalid: true });
			}

			await orderService.setOrderPartiallyPaid(order, amountNumber);
		}

		await trackServerEvent(
			appUser,
			{
				event: 'order_payment_status_changed',
				properties: { status: newStatus },
				orderId: order.id
			},
			locals.posthog
		);
	}
};
