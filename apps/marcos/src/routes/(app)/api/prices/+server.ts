import type { CustomSession, PreCalculatedItemPartRequest } from '$lib/type/api.type';
import { json } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { InvalidSizeError } from '@marcsimolduressonsardina/core/error';
import { CalculatedItemService } from '@marcsimolduressonsardina/core/service';

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const pricingRequest = (await request.json()) as PreCalculatedItemPartRequest;

	try {
		const calculatedItemService = new CalculatedItemService(
			AuthService.generateConfiguration(appUser)
		);
		const part = await calculatedItemService.calculatePart(
			pricingRequest.partToCalculate,
			pricingRequest.orderDimensions
		);

		return json(part);
	} catch (error: unknown) {
		if (error instanceof InvalidSizeError) {
			return json({ error: error.message }, { status: 400 });
		}

		return json({ error: 'Error computing the price' }, { status: 500 });
	}
}
