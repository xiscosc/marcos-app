import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { listPriceSchemaNew } from '@/shared/form-schema/pricing.form-schema';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service.js';
import { PricingService } from '@marcsimolduressonsardina/core/service';
import { PricingUtilites } from '@marcsimolduressonsardina/core/util';
import type {
	MaxArea,
	MaxAreaM2,
	PricingFormula,
	PricingType
} from '@marcsimolduressonsardina/core/type';
import { InvalidKeyError } from '@marcsimolduressonsardina/core/error';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals, true);
	const form = await superValidate(zod(listPriceSchemaNew));
	return { form };
};

export const actions = {
	async createOrEdit({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals, true);

		const form = await superValidate(request, zod(listPriceSchemaNew));
		if (!form.valid) {
			return fail(400, { form });
		}

		const pricingService = new PricingService(AuthService.generateConfiguration(appUser));
		try {
			const { price, maxD1, maxD2, areas, areasM2 } = PricingUtilites.cleanFormValues(
				form as unknown as {
					data: {
						formula: PricingFormula;
						areas: MaxArea[];
						areasM2: MaxAreaM2[];
						price: number;
						maxD1: number;
						maxD2: number;
					};
				}
			);

			await pricingService.createPricing(
				form.data.id,
				price,
				form.data.minPrice,
				form.data.discountAllowed,
				form.data.description,
				form.data.type as PricingType,
				form.data.formula,
				areas,
				areasM2,
				form.data.priority,
				maxD1,
				maxD2
			);
		} catch (error: unknown) {
			if (error instanceof InvalidKeyError) {
				return setError(form, 'id', 'Id already in use');
			}
			return setError(form, '', 'Error creando el item. Intente de nuevo.');
		}

		await trackServerEvent(
			appUser,
			{
				event: 'price_created',
				properties: {
					type: form.data.type,
					id: form.data.id
				}
			},
			locals.posthog
		);

		redirect(302, `/config/prices/list?type=${form.data.type}`);
	}
};
