import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type.js';
import { MoldPriceLoader } from '@marcsimolduressonsardina/core/data';
import { trackServerEvents } from '@/server/shared/analytics/posthog';

export async function GET({ locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser || !appUser.priceManager) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const moldPriceLoader = new MoldPriceLoader(AuthService.generateConfiguration(appUser));
	const { filename, url } = await moldPriceLoader.generateFileUploadUrl();

	await trackServerEvents(appUser, [
		{
			event: 'mold_price_upload_requested'
		}
	]);

	return json({ filename, url });
}

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser || !appUser.priceManager) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { filename } = (await request.json()) as { filename: string };
	if (filename == null) {
		return json({ error: 'Filename is required' }, { status: 400 });
	}

	try {
		const moldPriceLoader = new MoldPriceLoader(AuthService.generateConfiguration(appUser));
		await moldPriceLoader.loadMoldPrices(filename);
	} catch (error: unknown) {
		console.error(error);
		return json({ error: 'Error loading the prices' }, { status: 500 });
	}

	await trackServerEvents(appUser, [
		{
			event: 'mold_price_upload_completed'
		}
	]);

	return json({ success: true });
}
