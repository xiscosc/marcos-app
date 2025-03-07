import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AuthService } from '@/server/service/auth.service';

export const load = (async ({ locals }) => {
	await AuthService.checkAuth(locals);
	if (AuthService.isMainStore(locals.user) && !AuthService.isAdmin(locals.user)) {
		redirect(307, '/');
	}

	return {};
}) satisfies LayoutServerLoad;
