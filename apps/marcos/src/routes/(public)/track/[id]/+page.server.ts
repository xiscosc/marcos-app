import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';
import { trackAnonymousServerEvent } from '@/server/shared/analytics/posthog';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ params, locals }) => {
	const { id } = params as { id: string };

	if (id == null) {
		redirect(303, 'https://marcsimoldures.com/');
	}

	if (locals.user != null) {
		redirect(303, `/s/${id}`);
	}

	const fullOrder = await OrderService.getPublicOrder(AuthService.generatePublicConfig(), id);
	if (fullOrder == null) {
		redirect(303, 'https://marcsimoldures.com/');
	}

	if (fullOrder.order.status === OrderStatus.QUOTE) {
		redirect(303, `/s/${id}`);
	}

	trackAnonymousServerEvent(
		{
			event: 'public_order_track',
			orderId: fullOrder.order.id,
			customerId: fullOrder.order.customer.id,
			properties: {
				shortId: fullOrder.order.shortId
			}
		},
		locals.posthog
	);

	return {
		fullOrder,
		userLoggedIn: locals.user != null
	};
}) satisfies PageServerLoad;
