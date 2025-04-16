import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, request, url }) => {
	if (locals.user == null || !locals.user.priceManager) {
		redirect(302, '/');
	}

	const referer = request.headers.get('referer');
	const expectedReferer = `${url.origin}/config`;

	if (!referer || !referer.startsWith(expectedReferer)) {
		redirect(302, '/');
	}

	// If checks pass, load the page data
	return {};
}) satisfies PageServerLoad;
