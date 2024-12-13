import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	if (!appUser.priceManager) {
		throw error(403);
	}

	return {};
}) satisfies PageServerLoad;
