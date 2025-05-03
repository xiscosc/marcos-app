import { browser } from '$app/environment';
import posthog from 'posthog-js';

export const featureFlags = {};

export function runWhenFeatureIsEnabled(feature: string, callback: () => void) {
	if (browser) {
		posthog.reloadFeatureFlags();
		posthog.onFeatureFlags(function () {
			if (posthog.isFeatureEnabled(feature)) {
				callback();
			}
		});
	}
}
