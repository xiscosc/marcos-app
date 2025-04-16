import { AuthService } from '@/server/service/auth.service';
import type { PageServerLoad } from './$types';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const config = AuthService.generateConfiguration(locals.user!);
	const orderService = new OrderService(config);
	const fullOrder = await orderService.getFullOrderById(id);
	if (fullOrder == null) {
		redirect(301, `/orders/${id}`);
	}

	return {
		fullOrder,
		user: locals.user!
	};
}) satisfies PageServerLoad;
