import { OrderCreationUtilities } from '@/server/shared/order/order-creation.utilities';
import type { PageServerLoad } from './$types';
import { OrderActionNames } from '@/shared/mappings/order.mapping';

export const load = (async ({ locals, url }) => {
	const orderId = url.searchParams.get('originId');
	return await OrderCreationUtilities.handleCreateOrderFormPage(locals, orderId ?? undefined);
}) satisfies PageServerLoad;

export const actions = {
	[OrderActionNames.CREATE_ORDER]: async ({ request, locals, params }) => {
		const { id } = params;
		return await OrderCreationUtilities.handleCreateOrder(request, locals, id);
	},
	[OrderActionNames.CREATE_QUOTE]: async ({ request, locals, params }) => {
		const { id } = params;
		return await OrderCreationUtilities.handleCreateQuote(request, locals, id);
	}
};
