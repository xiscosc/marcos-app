import type { LayoutServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	await AuthService.checkAuth(locals);
	if (!AuthService.isAdmin(locals.user)) {
		redirect(302, '/');
	}
	return {};
}) satisfies LayoutServerLoad;
