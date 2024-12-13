import type { PageServerLoad } from './$types';
import { OrderCreationUtilities } from '$lib/server/shared/order/order-creation.utilities';

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
	async createOrder({ request, locals }) {
		return await OrderCreationUtilities.handleCreateOrder(false, request, locals);
	},

	async createQuote({ request, locals }) {
		return await OrderCreationUtilities.handleCreateOrder(true, request, locals);
	}
};
