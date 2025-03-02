import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { AuthService } from '@/server/service/auth.service';

export const load = (async ({ locals }) => {
	if (!AuthService.isMainStore(locals.user)) {
		redirect(307, '/external');
	}

	return {};
}) satisfies LayoutServerLoad;
