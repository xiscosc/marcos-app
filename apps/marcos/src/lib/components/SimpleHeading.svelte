<script lang="ts">
	import type { Snippet } from 'svelte';
	import { IconSize, IconType } from './icon/icon.enum';
	import Icon from './icon/Icon.svelte';

	interface Props {
		children: Snippet;
		icon: IconType;
	}

	let { children, icon }: Props = $props();
</script>

<div class="mt-5 flex flex-row items-center gap-2 lg:mt-0">
	<div class="flex md:hidden">
		<Icon type={icon} size={IconSize.BIG} />
	</div>
	<div class="hidden md:flex">
		<Icon type={icon} size={IconSize.XL} />
	</div>
	<div class="text-xl font-medium md:text-3xl">
		{@render children()}
	</div>
</div>
