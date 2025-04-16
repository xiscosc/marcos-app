import { OrderCreationUtilities } from '@/server/shared/order/order-creation.utilities';
import { OrderActionNames } from '@/shared/mappings/order.mapping';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const orderId = url.searchParams.get('originId');
	const orderCreationFormData = await OrderCreationUtilities.handleCreateOrderFormPage(
		locals,
		orderId ?? undefined
	);
	return {
		orderCreationFormData,
		isCopy: orderId != null
	};
}) satisfies PageServerLoad;

export const actions = {
	[OrderActionNames.CREATE_ORDER]: async ({ request, locals }) => {
		return await OrderCreationUtilities.handleCreateOrder(request, locals);
	},
	[OrderActionNames.CREATE_QUOTE]: async ({ request, locals }) => {
		return await OrderCreationUtilities.handleCreateQuote(request, locals);
	}
};
