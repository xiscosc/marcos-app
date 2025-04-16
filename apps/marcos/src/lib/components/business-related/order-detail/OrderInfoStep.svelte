<script lang="ts">
	import { type IconType } from '@/components/generic/icon/icon.enum';
	import Step from '@/components/generic/Step.svelte';

	interface Props {
		iconType: IconType;
		title: string;
		value: string;
		valueList?: string[];
	}

	let { iconType, title, value, valueList = [] }: Props = $props();
</script>

<Step icon={iconType} {title} subtitle={value} textList={valueList} />
