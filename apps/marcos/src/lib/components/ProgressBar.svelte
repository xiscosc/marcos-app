<script lang="ts">
	import { IconSize, IconType } from './icon/icon.enum';
	import Icon from './icon/Icon.svelte';

	interface Props {
		text?: string | undefined;
		icon?: IconType;
	}

	let { text = undefined, icon = IconType.LOADING }: Props = $props();
</script>

<div class="text-gray-600! flex w-full flex-col items-center justify-center gap-2">
	<div class="animate-bounce">
		<Icon size={IconSize.XXL} type={icon} />
	</div>
	<span class="text-lg">
		{#if text != null}
			{text}
		{:else}
			Cargando...
		{/if}
	</span>
</div>
