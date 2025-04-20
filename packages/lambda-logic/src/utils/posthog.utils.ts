import { PostHog } from 'posthog-node';

export function createPostHogClient(postHogKey: string): PostHog {
	return new PostHog(postHogKey, {
		host: 'https://eu.i.posthog.com',
		disableGeoip: false
	});
}
