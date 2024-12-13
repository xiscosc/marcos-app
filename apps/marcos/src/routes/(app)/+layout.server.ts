import { ENV_NAME } from '$env/static/private';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const user = await AuthUtilities.checkAuth(locals);
	return { user, envName: ENV_NAME };
}) satisfies LayoutServerLoad;
