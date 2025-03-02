import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const config = AuthService.generateConfiguration(locals.user!);
	const customerService = new CustomerService(config);
	const orderService = new OrderService(config, customerService);
	const customer = customerService.getCustomerById(id);
	const orders = await orderService.getOrdersByCustomerId(id);
	const quotes = await orderService.getOrdersByCustomerIdAndStatus(id, OrderStatus.QUOTE);
	return {
		customer,
		isPriceManager: AuthService.isAdmin(locals.user),
		totalOrders: (orders?.length ?? 0) + (quotes?.length ?? 0)
	};
}) satisfies PageServerLoad;

export const actions = {
	async deleteCustomer({ params, locals }) {
		const { id } = params;
		if (AuthService.isAdmin(locals.user)) {
			const config = AuthService.generateConfiguration(locals.user!);
			const customerService = new CustomerService(config);
			const orderService = new OrderService(config, customerService);
			const orders = await orderService.getOrdersByCustomerId(id);
			const quotes = await orderService.getOrdersByCustomerIdAndStatus(id, OrderStatus.QUOTE);
			if ((orders?.length ?? 0) + (quotes?.length ?? 0) === 0) {
				await customerService.deleteCustomerById(id);
			}
		} else {
			error(403);
		}

		redirect(303, `/`);
	}
};
