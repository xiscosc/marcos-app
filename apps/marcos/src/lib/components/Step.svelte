<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ButtonStyle, ButtonText, ButtonType } from './button/button.enum';
	import Button from './button/Button.svelte';
	import { IconType } from './icon/icon.enum';
	import Icon from './icon/Icon.svelte';

	interface Props {
		title: string;
		quantity?: number;
		subtitle: string;
		icon: IconType;
		deleteFunction?: () => void;
		otherAction?: Snippet;
		showDelete?: boolean;
		textList?: string[];
	}

	let {
		title,
		subtitle,
		icon,
		deleteFunction = () => {},
		showDelete = false,
		quantity = 0,
		otherAction = undefined,
		textList = []
	}: Props = $props();
</script>

<div class="flex w-full flex-col gap-2 rounded-md border border-gray-100 bg-gray-50 px-2 py-1">
	<div class="flex w-full flex-row justify-between">
		<div class="flex flex-row items-center justify-start gap-2">
			<div class="relative rounded-full border border-gray-100 bg-white p-2 text-gray-900">
				<div class="relative">
					<Icon type={icon} />
				</div>
				{#if quantity > 1}
					<span
						class="absolute -right-1 -top-1 rounded-full border border-red-800 bg-red-500 px-1 text-xs font-medium text-white"
					>
						{quantity}
					</span>
				{/if}
			</div>
			<div class="flex flex-col gap-1 pr-1 text-sm">
				<span class="line-clamp-1 font-medium">{title}</span>
				<span class="line-clamp-2">{subtitle}</span>
			</div>
		</div>
		<div class="flex flex-row items-center gap-1">
			{@render otherAction?.()}
			{#if showDelete}
				<Button
					icon={IconType.TRASH}
					buttonType={ButtonType.DEFAULT}
					text=""
					textType={ButtonText.GRAY}
					style={ButtonStyle.SOFT_DELETE}
					onClick={() => deleteFunction()}
				></Button>
			{/if}
		</div>
	</div>

	{#if textList.length > 0}
		<div class="px-2">
			<ul class="flex flex-col gap-1">
				{#each textList as value}
					<li class="whitespace-normal break-words text-sm text-gray-800">{value}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
