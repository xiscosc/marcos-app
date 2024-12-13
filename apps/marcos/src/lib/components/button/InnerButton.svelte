<script lang="ts">
	import { IconSize, IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
	interface Props {
		text: string;
		center?: boolean;
		iconType: IconType;
		iconSize?: IconSize;
	}

	let { text, center = true, iconType, iconSize }: Props = $props();
</script>

<div class="flex items-center gap-2 p-0" class:justify-center={center}>
	<Icon type={iconType} size={iconSize} />
	{#if text.length > 0}<span>{text}</span>{/if}
</div>
