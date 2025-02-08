<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import '../../app.pcss';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	onMount(() => {
		if (browser) {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: 'https://eu.i.posthog.com',
				person_profiles: 'identified_only',
				loaded: (ph) => {
					if (data.envName !== 'prod') {
						ph.opt_out_capturing();
						ph.set_config({ disable_session_recording: true });
					}
				}
			});
		}
		return;
	});
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

{@render children?.()}
