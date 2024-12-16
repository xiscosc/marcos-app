import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const searchQuery = url.searchParams.get('query') ?? undefined;
	const linkOrderId = url.searchParams.get('linkOrderId') ?? undefined;
	if (searchQuery == null) {
		error(400);
	}

	const decodedSearchQuery = atob(searchQuery);
	const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
	const customers = customerService.searchCustomers(decodedSearchQuery);
	return { customers, decodedSearchQuery, linkOrderId };
}) satisfies PageServerLoad;
