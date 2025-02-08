import posthog from 'posthog-js';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { browser } from '$app/environment';

export function initPosthog(envName: string) {
	if (browser) {
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: 'https://eu.i.posthog.com',
			person_profiles: 'identified_only',
			loaded: (ph) => {
				ph.group('env:store', `${envName}:main`);
			}
		});
	}
}
