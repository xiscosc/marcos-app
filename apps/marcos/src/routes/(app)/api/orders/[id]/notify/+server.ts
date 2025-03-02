import { AuthService } from '@/server/service/auth.service';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function GET({ locals, params }) {
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	await orderService.setOrderAsNotified(order);

	await trackServerEvent(
		locals.user!,
		{
			event: 'order_notified',

			orderId: id
		},
		locals.posthog
	);

	return json({ success: true });
}
