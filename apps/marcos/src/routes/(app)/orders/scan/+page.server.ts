import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { AuthUtilities } from '@/server/shared/auth/auth.utilites';
import { OrderService } from '@marcsimolduressonsardina/core/service';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const data = await request.formData();
		const scannedText = data.get('scannedText')?.toString();
		if (OrderService.validateOrderId(scannedText)) {
			trackServerEvent(
				appUser,
				{
					event: 'order_scan',
					orderId: scannedText
				},
				locals.posthog
			);

			return redirect(302, `/orders/${scannedText}`);
		}

		return fail(400, { scannedText, incorrect: true });
	}
};
