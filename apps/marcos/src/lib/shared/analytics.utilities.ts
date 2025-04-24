import posthog from 'posthog-js';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { browser, dev } from '$app/environment';
import type { AppUser } from '@marcsimolduressonsardina/core/type';

export function initPosthog(envName: string, appUser?: AppUser) {
	if (dev) {
		return;
	}

	if (browser) {
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: 'https://eu.i.posthog.com',
			person_profiles: 'identified_only',
			autocapture: false,
			loaded: (ph) => {
				ph.register({
					env: envName,
					store: appUser ? appUser.storeId : 'not_available'
				});
			}
		});

		if (appUser) {
			identifyUser(appUser, envName);
		}
	}
}

export function identifyUser(appUser: AppUser, envName: string) {
	if (dev) {
		return;
	}

	if (browser) {
		posthog.identify(appUser.id, {
			email: appUser.id,
			name: appUser.name,
			userEnv: envName
		});
	}
}
