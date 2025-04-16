<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Collapsible from '@/components/ui/collapsible/index.js';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';
	import Separator from '@/components/ui/separator/separator.svelte';

	interface Props {
		title?: string | undefined;
		icon?: IconType;
		collapsible?: boolean;
		collapsed?: boolean;
		nonCollapsibleContent?: Snippet;
		children?: Snippet;
	}

	let {
		title = undefined,
		icon,
		children,
		collapsible = false,
		collapsed = false,
		nonCollapsibleContent = undefined
	}: Props = $props();
</script>

<div class="h-min-100 flex flex-1 flex-col gap-4 rounded-md border border-gray-50 bg-white p-4">
	{#if !collapsible}
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
	{:else}
		<Collapsible.Root class="flex flex-col gap-4" open={!collapsed}>
			<Collapsible.Trigger>
				{#if title}
					<div class="flex flex-row items-center justify-between">
						<div class="flex items-center gap-3">
							{#if icon}
								<Icon type={icon} size={IconSize.BIG} />
							{/if}
							<div class="text-xl font-semibold text-gray-900">
								{title}
							</div>
						</div>

						<Icon type={IconType.COLLAPSE} />
					</div>
				{/if}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<div class="flex flex-col gap-3">
					{@render children?.()}
					{#if nonCollapsibleContent}
						<Separator />
					{/if}
				</div>
			</Collapsible.Content>
		</Collapsible.Root>

		{@render nonCollapsibleContent?.()}
	{/if}
</div>
