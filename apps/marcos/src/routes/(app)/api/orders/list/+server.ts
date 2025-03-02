import { AuthService } from '@/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	if (!AuthService.isAdmin(locals.user)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
	const { lastKey, status } = (await request.json()) as {
		lastKey?: Record<string, string | number>;
		status: OrderStatus;
	};

	const allowedStatus = [OrderStatus.QUOTE, OrderStatus.PENDING, OrderStatus.FINISHED];
	if (allowedStatus.indexOf(status) === -1) {
		return json({ error: 'Invalid status' }, { status: 400 });
	}

	const paginatedOrders = await orderService.getOrdersByStatusPaginated(status, lastKey);
	return json({ orders: paginatedOrders.orders, nextKey: paginatedOrders.nextKey });
}
