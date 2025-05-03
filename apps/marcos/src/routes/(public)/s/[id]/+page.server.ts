import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PublicReceiptService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';
import { trackAnonymousServerEvent } from '@/server/shared/analytics/posthog';

export const load = (async ({ params, locals }) => {
	const { id } = params as { id: string };

	if (id == null) {
		redirect(303, 'https://marcsimoldures.com/');
	}

	try {
		const receiptService = new PublicReceiptService(AuthService.generatePublicConfig());
		const fullOrder = await receiptService.getPublicOrder(id);
		if (fullOrder == null) {
			redirect(303, 'https://marcsimoldures.com/');
		}

		trackAnonymousServerEvent(
			{
				event: 'public_order_viewed',
				orderId: fullOrder.order.id,
				customerId: fullOrder.order.customer.id,
				properties: {
					trackingVersion: 1,
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
