<script lang="ts">
	import { type IconType } from '../icon/icon.enum';
	import Step from '../Step.svelte';

	interface Props {
		iconType: IconType;
		title: string;
		value: string;
		valueList?: string[];
	}

	let { iconType, title, value, valueList = [] }: Props = $props();
</script>

<Step icon={iconType} {title} subtitle={value} textList={valueList} />
