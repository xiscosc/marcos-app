import { AuthService } from '@/server/service/auth.service';
import type { CustomSession } from '@/type/api.type';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function GET({ locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(appUser));
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	await orderService.setOrderAsNotified(order);

	await trackServerEvent(
		appUser,
		{
			event: 'order_notified',

			orderId: id
		},
		locals.posthog
	);

	return json({ success: true });
}
