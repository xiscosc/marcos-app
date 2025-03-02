import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

const schema = z.object({
	phone: z.string().min(9).default('+34')
});

export const load = async ({ locals }) => {
	const form = await superValidate(zod(schema));
	return { form, canSeeList: AuthService.isAdmin(locals.user) };
};

export const actions = {
	async default({ request, locals }) {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			// Again, return { form } and things will just work.
			return fail(400, { form });
		}

		const customerService = new CustomerService(AuthService.generateConfiguration(locals.user!));
		const existingCustomer = await customerService.getCustomerByPhone(form.data.phone);
		if (existingCustomer) {
			redirect(302, `/customers/${existingCustomer.id}`);
		}

		const ulrEscapedPhone = encodeURIComponent(form.data.phone);
		redirect(302, `/customers/new?phone=${ulrEscapedPhone}`);
	}
};
