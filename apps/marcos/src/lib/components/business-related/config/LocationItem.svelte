<script lang="ts">
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		children?: Snippet;
	}

	let { text, children }: Props = $props();
</script>

<div
	class="flex transform items-center justify-between rounded-md border border-gray-300 bg-gray-100 p-4"
>
	<div class="flex items-center gap-1">
		<Icon type={IconType.LOCATION} />
		<span class="text-lg text-gray-800">
			{text}
		</span>
	</div>
	<div>
		{@render children?.()}
	</div>
</div>
