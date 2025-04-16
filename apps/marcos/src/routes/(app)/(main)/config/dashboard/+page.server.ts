import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const enabled = url.searchParams.get('enabled') === 'true';
	if (!enabled) {
		return redirect(302, '/');
	}
	return {};
}) satisfies PageServerLoad;
