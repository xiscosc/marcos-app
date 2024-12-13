import { OrderCreationUtilities } from '$lib/server/shared/order/order-creation.utilities';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	return await OrderCreationUtilities.handleCreateOrderFormPage(locals, id, true);
}) satisfies PageServerLoad;

export const actions = {
	async editOrder({ request, locals, params }) {
		const { id } = params;
		return await OrderCreationUtilities.handleEditOrder(request, locals, id);
	}
};
