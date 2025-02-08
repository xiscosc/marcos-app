import posthog from 'posthog-js';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { browser } from '$app/environment';
import { onMount } from 'svelte';

export function initPosthog(envName: string) {
	onMount(() => {
		if (browser) {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: 'https://eu.i.posthog.com',
				person_profiles: 'identified_only',
				loaded: (ph) => {
					ph.group('env:store', `${envName}:main`);
				}
			});
		}
	});
}
