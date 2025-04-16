<script lang="ts">
	import type { Snippet } from 'svelte';
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { isMdBreakpoint } from '@/stores/breakpoint.store';

	interface Props {
		children: Snippet;
		icon: IconType;
	}

	let { children, icon }: Props = $props();
</script>

<div class="mt-5 flex flex-row items-center gap-2 lg:mt-0">
	<div class="flex">
		<Icon type={icon} size={!$isMdBreakpoint ? IconSize.XL : IconSize.BIG} />
	</div>
	<div class="text-xl font-medium md:text-3xl">
		{@render children()}
	</div>
</div>
