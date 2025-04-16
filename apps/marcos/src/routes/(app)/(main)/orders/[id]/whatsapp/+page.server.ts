import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
	const order = await orderService.getOrderById(id);

	if (order == null) {
		return fail(404, { missing: true });
	}

	const orderCounters = await orderService.getOrdersCountOnSameDay(order);

	return { order, orderCounters };
}) satisfies PageServerLoad;
