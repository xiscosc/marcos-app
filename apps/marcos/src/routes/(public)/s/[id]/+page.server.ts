import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CalculatedItemService, OrderService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ params }) => {
	const { id } = params as { id: string };

	if (id == null) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}

	try {
		const order = await OrderService.getPublicOrder(AuthService.generatePublicConfig(), id);
		if (order == null) {
			throw redirect(303, 'https://marcsimoldures.com/');
		}

		const calculatedItemService = new CalculatedItemService(AuthService.generatePublicConfig());
		return {
			order,
			calculatedItem: await calculatedItemService.getCalculatedItem(order.id)
		};
	} catch (error) {
		throw redirect(303, 'https://marcsimoldures.com/');
	}
}) satisfies PageServerLoad;
