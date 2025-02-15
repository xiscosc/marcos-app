<script lang="ts">
	import { type Snippet, onMount } from 'svelte';
	import '../../app.css';
	import type { LayoutData } from './$types';
	import { initPosthog } from '@/shared/analytics.utilities';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	onMount(() => {
		initPosthog(data.envName);
	});
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

{@render children?.()}
