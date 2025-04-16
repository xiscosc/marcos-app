import { ENV_NAME } from '$env/static/private';
import type { LayoutServerLoad } from './$types';
import { AuthService } from '@/server/service/auth.service';

export const load = (async ({ locals }) => {
	await AuthService.checkAuth(locals);
	return { user: locals.user!, envName: ENV_NAME };
}) satisfies LayoutServerLoad;
