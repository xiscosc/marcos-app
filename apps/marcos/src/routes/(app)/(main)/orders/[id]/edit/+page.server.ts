import { OrderCreationUtilities } from '@/server/shared/order/order-creation.utilities';
import { OrderActionNames } from '@/shared/mappings/order.mapping';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	return await OrderCreationUtilities.handleCreateOrderFormPage(locals, id, true);
}) satisfies PageServerLoad;

export const actions = {
	[OrderActionNames.EDIT_ORDER]: async ({ request, locals, params }) => {
		const { id } = params;
		return await OrderCreationUtilities.handleEditOrder(request, locals, id);
	}
};
