import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { customerSchema } from '$lib/shared/form-schema/customer.form-schema';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

export const load = async ({ url }) => {
	const phone = url.searchParams.get('phone');
	const form = await superValidate(zod(customerSchema));
	if (phone) form.data.phone = phone;
	return { form };
};

export const actions = {
	async default({ request, locals }) {
		const form = await superValidate(request, zod(customerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const customerService = new CustomerService(AuthService.generateConfiguration(locals.user!));
		const existingCustomer = await customerService.getCustomerByPhone(form.data.phone);
		if (existingCustomer) {
			redirect(302, `/customers/${existingCustomer.id}`);
		}

		const customer = await customerService.createCustomer(form.data.name, form.data.phone);
		if (customer == null) {
			return error(500, 'Error creating customer');
		}

		await trackServerEvent(
			locals.user!,
			{
				event: 'customer_created',
				customerId: customer.id
			},
			locals.posthog
		);
		redirect(302, `/customers/${customer.id}`);
	}
};
