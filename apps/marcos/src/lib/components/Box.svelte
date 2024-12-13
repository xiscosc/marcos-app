<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './icon/Icon.svelte';
	import { IconSize, type IconType } from './icon/icon.enum';

	interface Props {
		title?: string | undefined;
		icon?: IconType;
		children?: Snippet;
	}

	let { title = undefined, icon, children }: Props = $props();
</script>

<div class="h-100 flex flex-1 flex-col space-y-4 rounded-md border border-gray-300 bg-white p-4">
	{#if title}
		<div class="flex items-center gap-3">
			{#if icon}
				<Icon type={icon} size={IconSize.BIG} />
			{/if}
			<div class="text-xl font-semibold text-gray-900">
				{title}
			</div>
		</div>
	{/if}

	<div>
		{@render children?.()}
	</div>
</div>
