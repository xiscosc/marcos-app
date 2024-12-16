import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { superValidate, setError } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { customerSchema } from '$lib/shared/customer.utilities';
import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { InvalidKeyError } from '@marcsimolduressonsardina/core/error';

export const load = (async ({ params, locals }) => {
	const { id } = params;
	const appUser = await AuthUtilities.checkAuth(locals);
	const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
	const customer = await customerService.getCustomerById(id);
	if (customer == null) {
		redirect(302, '/');
	}

	const form = await superValidate(zod(customerSchema));
	form.data.phone = customer.phone;
	form.data.name = customer.name;
	return { form };
}) satisfies PageServerLoad;

export const actions = {
	async default({ request, locals, params }) {
		const { id } = params;
		const appUser = await AuthUtilities.checkAuth(locals);
		const form = await superValidate(request, zod(customerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
		const existingCustomer = await customerService.getCustomerById(id);
		if (existingCustomer == null) {
			redirect(302, '/');
		}

		try {
			await customerService.updateCustomerData(existingCustomer, form.data.name, form.data.phone);
		} catch (error) {
			if (error instanceof InvalidKeyError) {
				return setError(form, 'phone', 'Número de teléfono ya en uso');
			}
			throw fail(500);
		}

		redirect(302, `/customers/${existingCustomer.id}`);
	}
};
