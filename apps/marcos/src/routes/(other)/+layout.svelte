<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import type { Snippet } from 'svelte';
	import '../../app.pcss';
	interface Props {
		children?: Snippet;
	}

	injectSpeedInsights();
	injectAnalytics();
	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#F7F5F2]">
	{@render children?.()}
</div>
