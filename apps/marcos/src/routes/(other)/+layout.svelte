<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import '../../app.pcss';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { PUBLIC_POSTHOG_KEY } from '$env/static/public';

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

<div class="flex min-h-screen flex-col bg-[#F7F5F2]">
	{@render children?.()}
</div>
