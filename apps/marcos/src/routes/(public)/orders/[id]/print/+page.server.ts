import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CalculatedItemService, OrderService } from '@marcsimolduressonsardina/core/service';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const calculatedItemService = new CalculatedItemService(config);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		redirect(301, `/orders/${id}`);
	}

	return {
		order,
		calculatedItem: await calculatedItemService.getCalculatedItem(id)
	};
}) satisfies PageServerLoad;
