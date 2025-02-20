import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';

const posthogContextHandle: Handle = async ({ event, resolve }) => {
	// Capture client context
	event.locals.posthog = {
		ip: event.getClientAddress(),
		user_agent: event.request.headers.get('user-agent'),
		current_url: event.url.toString(),
		path: event.url.pathname,
		referrer: event.request.headers.get('referer')
	};

	return resolve(event);
};

export const handle = sequence(authHandle, posthogContextHandle);
