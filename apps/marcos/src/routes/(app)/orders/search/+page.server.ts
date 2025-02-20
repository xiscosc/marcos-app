import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { orderPublicIdSchema, OrderUtilities } from '$lib/shared/order.utilities';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core/service';

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);

	const form = await superValidate(zod(orderPublicIdSchema));
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const form = await superValidate(request, zod(orderPublicIdSchema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const splits = form.data.id.split('/');
		if (splits.length !== 3) {
			return setError(form, 'id', 'No se ha encontrado el pedido');
		}

		const config = AuthService.generateConfiguration(appUser);
		const customerService = new CustomerService(config);
		const orderService = new OrderService(config, customerService);
		const existingCustomer = await customerService.getCustomerByPhone(`+${splits[2]}`);
		if (existingCustomer == null) {
			return setError(form, 'id', 'No se ha encontrado el pedido');
		}

		const orders = await orderService.getOrdersByCustomerId(existingCustomer.id);
		if (orders == null) {
			return setError(form, 'id', 'No se ha encontrado el pedido');
		}

		const filteredOrders = orders.filter(
			(fullOrder) => OrderUtilities.getOrderPublicId(fullOrder.order) === form.data.id
		);
		if (filteredOrders.length === 0) {
			return setError(form, 'id', 'Order not found');
		}

		redirect(303, `/orders/${filteredOrders[0].order.id}`);
	}
};
