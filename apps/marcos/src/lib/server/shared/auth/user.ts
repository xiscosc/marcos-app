import { type Handle } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type';

export const getUserHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();
	event.locals.user = AuthService.generateUserFromAuth(session as CustomSession);
	return resolve(event);
};
