import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { parseQrString } from '@/shared/qr.utilities';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals }) {
		const data = await request.formData();
		const scannedText = data.get('scannedText')?.toString();
		const qrInfo = parseQrString(scannedText);
		if (qrInfo != null) {
			trackServerEvent(
				locals.user!,
				{
					event: 'order_scan',
					orderId: qrInfo.orderId,
					properties: {
						qrOrigin: qrInfo.origin
					}
				},
				locals.posthog
			);

			return redirect(302, `/orders/${qrInfo.orderId}`);
		}

		return fail(400, { scannedText, incorrect: true });
	}
};
