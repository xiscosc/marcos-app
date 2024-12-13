<script lang="ts">
	import Spacer from './Spacer.svelte';
	import { type ListPrice, type PricingType } from '@marcsimolduressonsardina/core/type';
	import { formulasStringMap } from '$lib/shared/pricing.utilites';
	import Button from '../button/Button.svelte';
	import { IconType } from '../icon/icon.enum';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '../button/button.enum';
	import { PricingUtilites } from '@marcsimolduressonsardina/core/util';

	interface Props {
		sectionTitle: string;
		label: string;
		addValue: (pricingType: PricingType, value?: string) => void;
		pricingType: PricingType;
		prices: ListPrice[];
		added: boolean;
	}

	let { sectionTitle, label, addValue, pricingType, prices, added }: Props = $props();

	let autocompleteInput = $state('');

	function getSelectLabel(price: ListPrice) {
		if (price.description == null || price.description === '') {
			return `${price.id} (${PricingUtilites.getPriceString(price, formulasStringMap)})`;
		}
		return `${price.description} (${PricingUtilites.getPriceString(price, formulasStringMap)})`;
	}

	function addFunction(id: string) {
		addValue(pricingType, id);
		autocompleteInput = '';
	}

	let filteredPrices = $derived(
		autocompleteInput.length < 2
			? []
			: prices.filter((price) => price.id.includes(autocompleteInput))
	);
</script>

<Spacer title={sectionTitle} />
<div class="flex flex-col gap-2 lg:col-span-2">
	<Label for="autocomplete-search">{label}:</Label>
	<Input
		id="autocomplete-search"
		bind:value={autocompleteInput}
		placeholder="Referencia... (mínimo 2 caracteres)"
		success={added}
	/>
</div>
<div
	class="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-sm p-1 lg:col-span-2"
	class:border={autocompleteInput.length >= 2}
>
	{#each filteredPrices as price}
		<Button
			text={getSelectLabel(price)}
			icon={IconType.PLUS}
			style={ButtonStyle.ORDER_GENERIC_VARIANT}
			action={ButtonAction.CLICK}
			textType={ButtonText.GRAY}
			onClick={() => addFunction(price.id)}
		></Button>
	{/each}
	{#if filteredPrices.length === 0 && autocompleteInput.length > 2}
		<p class="text-center text-sm font-medium">No se encontraron resultados</p>
	{/if}
</div>
