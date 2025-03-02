import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals, url }) => {
	const searchQuery = url.searchParams.get('query') ?? undefined;
	if (searchQuery == null) {
		error(400);
	}

	const decodedSearchQuery = atob(searchQuery);
	const customerService = new CustomerService(AuthService.generateConfiguration(locals.user!));
	const customers = customerService.searchCustomers(decodedSearchQuery);
	return { customers, decodedSearchQuery };
}) satisfies PageServerLoad;
