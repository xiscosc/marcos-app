import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

const schema = z.object({
	phone: z.string().min(9).default('+34')
});

export const load = async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);

	const form = await superValidate(zod(schema));
	return { form, canSeeList: appUser.priceManager };
};

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
		const existingCustomer = await customerService.getCustomerByPhone(form.data.phone);
		if (existingCustomer) {
			return redirect(302, `/customers/${existingCustomer.id}`);
		}

		const ulrEscapedPhone = encodeURIComponent(form.data.phone);
		return redirect(302, `/customers/new?phone=${ulrEscapedPhone}`);
	}
};
