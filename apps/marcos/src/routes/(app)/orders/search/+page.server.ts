import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { orderPublicIdSchema } from '$lib/shared/order.utilities';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';

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
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		const orderId = await orderService.getOrderIdByPublicId(form.data.id);
		if (orderId == null) {
			return setError(form, 'id', 'No se ha encontrado el pedido');
		}

		redirect(303, `/orders/${orderId}`);
	}
};
