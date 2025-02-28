<script lang="ts">
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';

	interface Props {
		clicked?: boolean;
		text: string;
	}

	let { clicked = $bindable(false), text }: Props = $props();
</script>

<button
	class="flex w-full flex-row items-center justify-center gap-2 rounded-sm bg-gray-800 p-1 text-sm text-white"
	class:bg-indigo-800={clicked}
	type="button"
	onclick={() => {
		clicked = !clicked;
	}}
>
	{#if clicked}
		<Icon type={IconType.DONE} size={IconSize.SMALL} />
	{/if}
	<span>
		{text}
	</span>
</button>
