import type { LayoutServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';

export const load = (async ({ locals }) => {
	await AuthService.checkAuth(locals);
	return {};
}) satisfies LayoutServerLoad;
