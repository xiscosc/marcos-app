<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import '../../app.pcss';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: 'https://eu.i.posthog.com',
				person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
			});
		}
		return;
	});
	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

{@render children?.()}
