import posthog from 'posthog-js';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { browser } from '$app/environment';
import type { AppUser } from '@marcsimolduressonsardina/core/type';

export function initPosthog(envName: string, appUser?: AppUser) {
	if (browser) {
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: 'https://eu.i.posthog.com',
			person_profiles: 'identified_only',
			loaded: (ph) => {
				ph.group('env:store', `${envName}:main`);
			}
		});

		if (appUser) {
			identifyUser(appUser);
		}
	}
}

export function identifyUser(appUser: AppUser) {
	if (browser) {
		posthog.identify(appUser.id, {
			email: appUser.id,
			name: appUser.name
		});
	}
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
	if (browser) {
		posthog.capture(event, properties);
	}
}

export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
	trackEvent(`visited ${pageName}`, properties);
}

export function trackOrderEvent(
	action: string,
	orderId: string,
	properties?: Record<string, unknown>
) {
	trackEvent(`order ${action}`, { ...properties, orderId });
}
