import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AuthService } from '@/server/service/auth.service';

export const load = (async ({ locals }) => {
	if (!AuthService.isAdmin(locals.user)) {
		error(403);
	}

	return {};
}) satisfies PageServerLoad;
