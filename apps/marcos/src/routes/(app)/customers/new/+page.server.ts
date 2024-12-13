import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { customerSchema } from '$lib/shared/customer.utilities';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '@marcsimolduressonsardina/core/service';

export const load = async ({ url, locals }) => {
	await AuthUtilities.checkAuth(locals);
	const phone = url.searchParams.get('phone');
	const form = await superValidate(zod(customerSchema));
	if (phone) form.data.phone = phone;
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const form = await superValidate(request, zod(customerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
		const existingCustomer = await customerService.getCustomerByPhone(form.data.phone);
		if (existingCustomer) {
			return redirect(302, `/customers/${existingCustomer.id}`);
		}

		const customer = await customerService.createCustomer(form.data.name, form.data.phone);
		if (customer == null) {
			return error(500, 'Error creating customer');
		}

		return redirect(302, `/customers/${customer.id}`);
	}
};
