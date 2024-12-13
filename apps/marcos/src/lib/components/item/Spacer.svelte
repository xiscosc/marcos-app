<script lang="ts">
	interface Props {
		title: string;
		line?: boolean;
	}

	let { title, line = true }: Props = $props();
</script>

{#if line}
	<hr class="my-4 border-t border-gray-200 lg:col-span-2" />
{/if}
<span class="text-xl font-medium lg:col-span-2">{title}</span>
