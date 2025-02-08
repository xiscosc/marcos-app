<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import '../../app.pcss';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import type { LayoutData } from './$types';

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
	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#F7F5F2]">
	{@render children?.()}
</div>
