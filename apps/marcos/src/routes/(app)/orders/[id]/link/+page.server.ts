import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { linkCustomerSchema } from '$lib/shared/form-schema/customer.form-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderUtilities } from '@marcsimolduressonsardina/core/util';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const config = AuthService.generateConfiguration(locals.user!);
	const orderService = new OrderService(config);

	const fullOrder = await orderService.getFullOrderById(id);
	if (fullOrder == null) {
		redirect(302, `/`);
	}

	if (!OrderUtilities.isOrderTemp(fullOrder.order)) {
		redirect(302, `/orders/${id}`);
	}

	const form = await superValidate(zod(linkCustomerSchema));
	return {
		form,
		orderName: fullOrder.order.status === OrderStatus.QUOTE ? 'presupuesto' : 'pedido',
		fullOrder: fullOrder
	};
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const { id } = params;
		const config = AuthService.generateConfiguration(locals.user!);
		const customerService = new CustomerService(config);
		const orderService = new OrderService(config, customerService);

		const order = await orderService.getOrderById(id);
		if (!order || !OrderUtilities.isOrderTemp(order)) {
			return fail(404, { missing: true });
		}

		const form = await superValidate(request, zod(linkCustomerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let customer = undefined;
		customer = await customerService.getCustomerByPhone(form.data.phone);
		if (customer != null) {
			await orderService.addCustomerToTemporaryOrder(customer, order);
			trackServerEvent(
				locals.user!,
				{
					event: 'order_customer_linked_from_phone',
					orderId: order.id,
					customerId: customer.id
				},
				locals.posthog
			);
		} else {
			if (form.data.name != null && (form.data.name as unknown as string).length >= 3) {
				customer = await customerService.createCustomer(form.data.name!, form.data.phone);
				await orderService.addCustomerToTemporaryOrder(customer, order);
				trackServerEvent(
					locals.user!,
					{
						event: 'order_customer_linked_from_new_customer',
						orderId: order.id,
						customerId: customer.id
					},
					locals.posthog
				);
			} else {
				return setError(
					form,
					'name',
					'No existe cliente con ese número, rellene el nombre para crearlo'
				);
			}
		}

		redirect(302, `/orders/${id}/files`);
	}
};
