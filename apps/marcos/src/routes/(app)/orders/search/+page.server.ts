import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { orderPublicIdSchema } from '@/shared/form-schema/order.form-schema';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { trackServerEvent } from '@/server/shared/analytics/posthog.js';

export const load = async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);

	const form = await superValidate(zod(orderPublicIdSchema));
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const form = await superValidate(request, zod(orderPublicIdSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		const orderId = await orderService.getOrderIdByPublicId(form.data.id);
		if (orderId == null) {
			return setError(form, 'id', 'No se ha encontrado el pedido');
		}

		await trackServerEvent(
			appUser,
			{ event: 'order_search_by_public_id', orderId },
			locals.posthog
		);
		redirect(303, `/orders/${orderId}`);
	}
};
