import { OrderCreationUtilities } from '@/server/shared/order/order-creation.utilities';
import type { PageServerLoad } from './$types';
import { OrderActionNames } from '@/shared/mappings/order.mapping';

export const load = (async ({ locals }) => {
	const orderCreationFormData = await OrderCreationUtilities.handleCreateOrderFormPage(locals);
	return {
		orderCreationFormData
	};
}) satisfies PageServerLoad;

export const actions = {
	[OrderActionNames.CREATE_EXTERNAL_ORDER]: async ({ request, locals }) => {
		return await OrderCreationUtilities.handleCreateExternalOrder(request, locals);
	}
};
