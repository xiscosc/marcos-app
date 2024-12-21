<script lang="ts">
	import { type IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		iconType: IconType;
		title: string;
		value: string;
		valueList?: string[];
		freeText?: boolean;
	}

	let { iconType, title, value, valueList = undefined, freeText = false }: Props = $props();
</script>

<div class="flex w-full flex-col gap-2 rounded-md border border-gray-300 bg-gray-50 px-2 py-1">
	<div class="flex flex-row items-center justify-start gap-2">
		<div class="rounded-full bg-gray-800 p-2 text-white">
			<Icon type={iconType} />
		</div>
		<div class="flex flex-col gap-1 text-sm">
			<span>{title}</span>
			{#if value.length > 0}
				<span class:font-medium={!freeText}>{value}</span>
			{/if}
		</div>
	</div>
	{#if valueList && valueList.length > 0}
		<div class="px-2">
			<ul class="flex flex-col gap-1">
				{#each valueList as value}
					<li class="whitespace-normal break-words text-sm text-gray-800">{value}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
