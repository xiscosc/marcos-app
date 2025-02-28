<script lang="ts">
	import { IconSize, type IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';

	interface Props {
		colorName: string;
		icon: IconType;
		title: string;
		text: string;
	}

	const colorVariants: Record<string, string> = {
		blue: 'bg-blue-100 border-blue-500',
		red: 'bg-red-100 border-red-500',
		green: 'bg-green-100 border-green-500',
		purple: 'bg-purple-100 border-purple-500',
		amber: 'bg-amber-100 border-amber-500',
		violet: 'bg-violet-100 border-violet-500',
		indigo: 'bg-indigo-100 border-indigo-500',
		teal: 'bg-teal-100 border-teal-500',
		sky: 'bg-sky-100 border-sky-500'
	};

	const textColorVariants: Record<string, string> = {
		blue: 'text-blue-800',
		red: 'text-red-800',
		green: 'text-green-800',
		purple: 'text-purple-800',
		amber: 'text-amber-800',
		violet: 'text-violet-800',
		indigo: 'text-indigo-800',
		teal: 'text-teal-800',
		sky: 'text-sky-800'
	};

	let { colorName, icon, title, text }: Props = $props();
</script>

<div class={`rounded-md border ${colorVariants[colorName]} p-6`}>
	<div class="flex flex-col gap-3">
		<div class={`flex items-center gap-2 ${textColorVariants[colorName]}`}>
			<Icon type={icon} size={IconSize.XL} />
			<h3 class="text-xl font-bold">{title}</h3>
		</div>
		{#if text.length > 0}
			<p class="text-sm text-black">{text}</p>
		{/if}
	</div>
</div>
