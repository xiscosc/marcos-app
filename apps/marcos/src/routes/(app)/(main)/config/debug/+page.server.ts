import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (locals.user == null || !locals.user.priceManager) {
		redirect(302, '/');
	}
	return {};
}) satisfies PageServerLoad;
