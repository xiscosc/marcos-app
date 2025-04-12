import type { PreCalculatedItemPartRequest } from '@/type/api.type';
import { json } from '@sveltejs/kit';
import { AuthService } from '@/server/service/auth.service';
import { InvalidSizeError } from '@marcsimolduressonsardina/core/error';
import { CalculatedItemService, PricingService } from '@marcsimolduressonsardina/core/service';

export async function POST({ request, locals }) {
	const pricingRequest = (await request.json()) as PreCalculatedItemPartRequest;

	try {
		const config = AuthService.generateConfiguration(locals.user!);
		const calculatedItemService = new CalculatedItemService(
			config,
			new PricingService(config, pricingRequest.markup)
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
