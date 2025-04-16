import type { PageServerLoad } from './$types';
import { AuthService } from '@/server/service/auth.service';
export const load = (async ({ locals }) => {
	return { priceManager: AuthService.isAdmin(locals.user) };
}) satisfies PageServerLoad;
