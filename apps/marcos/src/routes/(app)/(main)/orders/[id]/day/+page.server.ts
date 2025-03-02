import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
	const order = await orderService.getOrderById(id);
	if (order == null) {
		redirect(303, '/');
	}

	return { orders: orderService.getOrdersOnSameDay(order) };
}) satisfies PageServerLoad;
