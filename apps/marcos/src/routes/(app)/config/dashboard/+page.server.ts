import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	await AuthUtilities.checkAuth(locals, true);
	return {};
}) satisfies PageServerLoad;
