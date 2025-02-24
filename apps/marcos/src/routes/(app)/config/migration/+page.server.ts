import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '@/server/service/auth.service';
import { OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';
import { OrderUtilities } from '@/shared/order.utilities';

export const load = (async ({ locals }) => {
	const user = await AuthUtilities.checkAuth(locals);
	const orderService = new OrderService(AuthService.generateConfiguration(user));

	// For possible values of orderstatus
	const statusValues = Object.values(OrderStatus);
	for (const status of statusValues) {
		console.log(`Updating public id for ${status} orders`);
		const orders = await orderService.getStandaloneOrdersByStatus(status);
		console.log(`Found ${orders.length} orders`);
		await updateOrderPublicId(orders, orderService);
	}
}) satisfies PageServerLoad;

async function updateOrderPublicId(orders: Order[], orderService: OrderService) {
	for (const order of orders) {
		if (order.publicId == null) {
			await orderService.updateOrderPublicId(order, OrderUtilities.getOrderPublicId(order));
		}
	}
}
