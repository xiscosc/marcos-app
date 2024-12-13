import type { PageServerLoad } from './$types';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';

export const load = (async ({ locals }) => {
	await AuthUtilities.checkAuth(locals);
}) satisfies PageServerLoad;
