import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { linkCustomerSchema } from '$lib/shared/customer.utilities';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import {
	CalculatedItemService,
	CustomerService,
	OrderService
} from '@marcsimolduressonsardina/core/service';
import { OrderUtilities } from '@marcsimolduressonsardina/core/util';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const calculatedItemService = new CalculatedItemService(config);

	const order = await orderService.getOrderById(id);
	const calculatedItem = await calculatedItemService.getCalculatedItem(id);
	if (order == null || calculatedItem == null) {
		redirect(302, `/`);
	}

	if (!OrderUtilities.isOrderTemp(order)) {
		redirect(302, `/orders/${id}`);
	}

	const form = await superValidate(zod(linkCustomerSchema));
	return {
		form,
		orderName: order.status === OrderStatus.QUOTE ? 'presupuesto' : 'pedido',
		order,
		calculatedItem
	};
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const { id } = params;
		const config = AuthService.generateConfiguration(appUser);
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
		} else {
			if (form.data.name != null && (form.data.name as unknown as string).length >= 3) {
				customer = await customerService.createCustomer(form.data.name!, form.data.phone);
				await orderService.addCustomerToTemporaryOrder(customer, order);
			} else {
				return setError(form, 'name', 'Name required');
			}
		}

		redirect(302, `/orders/${id}/files`);
	}
};
