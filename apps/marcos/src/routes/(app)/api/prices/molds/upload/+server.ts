import { json } from '@sveltejs/kit';
import { AuthService } from '@/server/service/auth.service';
import { MoldPriceLoader } from '@marcsimolduressonsardina/core/data';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

export async function GET({ locals }) {
	if (!AuthService.isAdmin(locals.user)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const moldPriceLoader = new MoldPriceLoader(AuthService.generateConfiguration(locals.user!));
	const { filename, url } = await moldPriceLoader.generateFileUploadUrl();

	await trackServerEvent(
		locals.user!,
		{
			event: 'mold_price_upload_requested'
		},
		locals.posthog
	);

	return json({ filename, url });
}

export async function POST({ request, locals }) {
	const { filename } = (await request.json()) as { filename: string };
	if (filename == null) {
		return json({ error: 'Filename is required' }, { status: 400 });
	}

	try {
		const moldPriceLoader = new MoldPriceLoader(AuthService.generateConfiguration(locals.user!));
		await moldPriceLoader.loadMoldPrices(filename);
	} catch (error: unknown) {
		console.error(error);
		return json({ error: 'Error loading the prices' }, { status: 500 });
	}

	await trackServerEvent(
		locals.user!,
		{
			event: 'mold_price_upload_completed'
		},
		locals.posthog
	);

	return json({ success: true });
}
