import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	return { priceManager: appUser.priceManager };
}) satisfies PageServerLoad;
