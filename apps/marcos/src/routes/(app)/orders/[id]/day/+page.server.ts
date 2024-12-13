import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const orderService = new OrderService(AuthService.generateConfiguration(appUser));
	const order = await orderService.getOrderById(id);
	if (order == null) {
		throw redirect(303, '/');
	}

	return { orders: orderService.getOrdersOnSameDay(order) };
}) satisfies PageServerLoad;
