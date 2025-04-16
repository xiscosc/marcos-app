<script lang="ts">
	import ObservationChip from '@/components/business-related/order-form/ObservationChip.svelte';

	interface Props {
		values: string[];
		filledValues: string[];
	}

	let { values, filledValues = $bindable([]) }: Props = $props();
	const initialFilledValues = filledValues;

	let filledList: boolean[] = $state(values.map((value) => initialFilledValues.includes(value)));
	$effect(() => {
		filledValues = values
			.map((value, index) => (filledList[index] ? value : null))
			.filter((value) => value != null);
	});
</script>

{#each values as value, i}
	<ObservationChip text={value} bind:clicked={filledList[i]} />
{/each}
