import posthog from 'posthog-js';
import type { HandleClientError } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handleClientErrorWithPostHog: HandleClientError = async ({ error, status }) => {
	if (status !== 404 && !dev) {
		posthog.captureException(error);
	}
};
