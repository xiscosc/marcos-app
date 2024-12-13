import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import type { OrderStatus } from '@marcsimolduressonsardina/core/type';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const orderService = new OrderService(AuthService.generateConfiguration(appUser));
	const { query, status } = (await request.json()) as { query: string; status: OrderStatus };
	const orders = await orderService.findOrdersByStatus(status, query);
	return json({ results: orders });
}
