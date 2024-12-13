import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import {
	CalculatedItemService,
	ConfigService,
	FileService,
	OrderService,
	type ISameDayOrderCounters
} from '@marcsimolduressonsardina/core/service';
import {
	OrderStatus,
	PaymentStatus,
	type AppUser,
	type CalculatedItem,
	type Order
} from '@marcsimolduressonsardina/core/type';
import { AuthService } from '$lib/server/service/auth.service';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { locationOrderSchema, promoteOrderSchema } from '$lib/shared/order.utilities';

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
	return order;
}

async function loadData(
	user: AppUser,
	orderId: string
): Promise<{
	order: Order | null;
	unfinishedSameDayCount: ISameDayOrderCounters;
	calculatedItem: CalculatedItem | null;
	hasFiles: boolean;
	locations: string[];
}> {
	const config = AuthService.generateConfiguration(user);
	const orderService = new OrderService(config);
	const configService = new ConfigService(config);
	const calculatedItemService = new CalculatedItemService(config);
	const fileService = new FileService(config);
	const order = await orderService.getOrderById(orderId);
	const calculatedItem = await calculatedItemService.getCalculatedItem(orderId);
	const files = await fileService.getFilesByOrder(orderId);
	const locations = await configService.getLocationsList();
	const unfinishedSameDayCount = order
		? await orderService.getOrdersCountOnSameDay(order)
		: { finishedCount: 0, pendingCount: 0, totalCount: 1 };
	return { order, calculatedItem, hasFiles: files.length > 0, unfinishedSameDayCount, locations };
}

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const promoteForm = await superValidate(zod(promoteOrderSchema), { id: 'promote-order-form' });
	const locationForm = await superValidate(zod(locationOrderSchema), { id: 'location-order-form' });
	const statusLocationForm = await superValidate(zod(locationOrderSchema), {
		id: 'status-location-order-form'
	});

	const { id } = params;
	return {
		info: loadData(appUser, id),
		isPriceManager: appUser.priceManager,
		promoteForm,
		locationForm,
		statusLocationForm
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
		const formData = await request.formData();
		const newStatus = formData.get('status') as OrderStatus;
		await setOrderStatus(newStatus, params, locals);
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
	}
};
