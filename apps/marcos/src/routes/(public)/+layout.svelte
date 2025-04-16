<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

{@render children?.()}
