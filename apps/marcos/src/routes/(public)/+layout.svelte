<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import type { Snippet } from 'svelte';
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

{@render children?.()}
