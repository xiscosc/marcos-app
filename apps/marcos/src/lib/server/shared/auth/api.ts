import { type Handle } from '@sveltejs/kit';
import { AuthService } from '@/server/service/auth.service';

/**

 */
export const apiAuthHandler: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		if (!event.locals.user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		if (
			!AuthService.isMainStore(event.locals.user) &&
			!(event.url.pathname === '/api/prices' && event.request.method === 'POST')
		) {
			return new Response(JSON.stringify({ error: 'Unauthorized for this API endpoint' }), {
				status: 403,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
	}

	return await resolve(event);
};
