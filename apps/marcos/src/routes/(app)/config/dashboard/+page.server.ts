import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
	await AuthUtilities.checkAuth(locals, true);
	const enabled = url.searchParams.get('enabled') === 'true';
	if (!enabled) {
		return redirect(302, '/');
	}
	return {};
}) satisfies PageServerLoad;
