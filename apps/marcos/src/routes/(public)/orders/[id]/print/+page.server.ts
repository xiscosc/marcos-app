import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CalculatedItemService, OrderService } from '@marcsimolduressonsardina/core/service';

export const load = (async ({ params, locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const calculatedItemService = new CalculatedItemService(config);

	return {
		order: await orderService.getOrderById(id),
		calculatedItem: await calculatedItemService.getCalculatedItem(id)
	};
}) satisfies PageServerLoad;
