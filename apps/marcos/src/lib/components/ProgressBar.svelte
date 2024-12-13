<script lang="ts">
	import { IconSize, IconType } from './icon/icon.enum';
	import Icon from './icon/Icon.svelte';

	interface Props {
		text?: string | undefined;
	}

	let { text = undefined }: Props = $props();
</script>

<div class="flex w-full flex-col items-center justify-center gap-2 !text-gray-600">
	<div class="animate-bounce">
		<Icon size={IconSize.XXL} type={IconType.LOADING} />
	</div>
	<span class="text-lg">
		{#if text != null}
			{text}
		{:else}
			Cargando...
		{/if}
	</span>
</div>
