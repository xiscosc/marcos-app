import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const fullOrder = await orderService.getFullOrderById(id);
	if (fullOrder == null) {
		redirect(301, `/orders/${id}`);
	}

	return {
		fullOrder,
		user: appUser
	};
}) satisfies PageServerLoad;
