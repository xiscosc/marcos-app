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
		const order = await OrderService.getPublicOrder(AuthService.generatePublicConfig(), id);
		if (order == null) {
			redirect(303, 'https://marcsimoldures.com/');
		}

		const calculatedItemService = new CalculatedItemService(AuthService.generatePublicConfig());

		trackAnonymousServerEvent(
			{
				event: 'public_order_viewed',
				orderId: order.id,
				customerId: order.customer.id,
				properties: {
					shortId: order.shortId
				}
			},
			locals.posthog
		);

		return {
			order,
			calculatedItem: await calculatedItemService.getCalculatedItem(order.id)
		};
	} catch (error) {
		redirect(303, 'https://marcsimoldures.com/');
	}
}) satisfies PageServerLoad;
