import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CalculatedItemService, OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';
import { trackAnonymousServerEvents } from '@/server/shared/analytics/posthog';

export const load = (async ({ params }) => {
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

		trackAnonymousServerEvents(
			[
				{
					event: 'public_order_viewed',
					properties: {
						shortId: order.shortId
					}
				}
			],
			order.id,
			order.customer.id
		);

		return {
			order,
			calculatedItem: await calculatedItemService.getCalculatedItem(order.id)
		};
	} catch (error) {
		redirect(303, 'https://marcsimoldures.com/');
	}
}) satisfies PageServerLoad;
