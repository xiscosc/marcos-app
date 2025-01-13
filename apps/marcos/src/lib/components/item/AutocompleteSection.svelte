<script lang="ts">
	import Fuse from 'fuse.js';
	import Spacer from './Spacer.svelte';
	import { type ListPrice, type PricingType } from '@marcsimolduressonsardina/core/type';
	import { formulasStringMap } from '$lib/shared/pricing.utilites';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { IconType } from '../icon/icon.enum';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';
	import { PricingUtilites } from '@marcsimolduressonsardina/core/util';
	import Icon from '../icon/Icon.svelte';

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

	const fuse = new Fuse(prices, {
		keys: ['id', 'description'],
		isCaseSensitive: false,
		threshold: 0.1
	});

	let filteredPrices: ListPrice[] = $derived(
		autocompleteInput.length < 2 ? [] : fuse.search(autocompleteInput).map((result) => result.item)
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
{#if autocompleteInput.length >= 2}
	<ScrollArea class="h-72 rounded-md border lg:col-span-2">
		<div class="p-4">
			<h4 class="mb-4 text-sm font-medium leading-none">Búsqueda de marcos / molduras</h4>
			{#each filteredPrices as price}
				<button
					class="flexr-row flex w-full items-center gap-2 rounded-md p-2 hover:bg-gray-50"
					onclick={() => addFunction(price.id)}
					type="button"
				>
					<Icon type={IconType.ADD} />
					{getSelectLabel(price)}
				</button>
				<Separator class="my-2 last:hidden" />
			{/each}
			{#if filteredPrices.length === 0}
				<div class="flex flex-row items-center gap-2 p-2">
					<Icon type={IconType.NOT_FOUND} />
					<span>No se encontraron resultados</span>
				</div>
			{/if}
		</div>
	</ScrollArea>
{/if}
