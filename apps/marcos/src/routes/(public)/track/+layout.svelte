<script lang="ts">
	import { type Snippet } from 'svelte';
	import '../../../app.css';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-100">
	{@render children?.()}
</div>
