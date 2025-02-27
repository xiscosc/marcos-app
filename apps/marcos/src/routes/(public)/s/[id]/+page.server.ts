import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CalculatedItemService, OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';
import { trackAnonymousServerEvent } from '@/server/shared/analytics/posthog';

export const load = (async ({ params, locals }) => {
	const { id } = params as { id: string };

	if (id == null) {
		redirect(303, 'https://marcsimoldures.com/');
	}

	try {
		const fullOrder = await OrderService.getPublicOrder(AuthService.generatePublicConfig(), id);
		if (fullOrder == null) {
			redirect(303, 'https://marcsimoldures.com/');
		}

		trackAnonymousServerEvent(
			{
				event: 'public_order_viewed',
				orderId: fullOrder.order.id,
				customerId: fullOrder.order.customer.id,
				properties: {
					shortId: fullOrder.order.shortId
				}
			},
			locals.posthog
		);

		return {
			fullOrder
		};
	} catch (error) {
		redirect(303, 'https://marcsimoldures.com/');
	}
}) satisfies PageServerLoad;
