import type { PageServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ params, locals, url }) => {
	const { id } = params;
	const showQuotes = url.searchParams.get('quotes') != null;
	const config = AuthService.generateConfiguration(locals.user!);
	const customerService = new CustomerService(config);
	const orderService = new OrderService(config, customerService);
	const customer = await customerService.getCustomerById(id);
	const orders = showQuotes
		? orderService.getOrdersByCustomerIdAndStatus(id, OrderStatus.QUOTE)
		: orderService.getOrdersByCustomerId(id);

	return { orders, customer, showQuotes };
}) satisfies PageServerLoad;
