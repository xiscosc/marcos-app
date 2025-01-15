<script lang="ts">
	import Spacer from './Spacer.svelte';
	import type { ListPriceWithMold, PricingType } from '@marcsimolduressonsardina/core/type';
	import Button from '../button/Button.svelte';
	import { IconSize, IconType } from '../icon/icon.enum';
	import Label from '../ui/label/label.svelte';
	import Input from '../ui/input/input.svelte';
	import type { Snippet } from 'svelte';
	import * as NativeSelect from '../ui/native-select/index.js';

	interface Props {
		sectionTitle: string;
		label: string;
		addValue: (
			pricingType: PricingType,
			value?: string,
			moldId?: string,
			extraInfo?: string
		) => void;
		prices: ListPriceWithMold[];
		extraPrices?: ListPriceWithMold[];
		locationIdForExtraPrices?: string | undefined;
		showExtraInfo?: boolean;
		added: boolean;
		children?: Snippet;
	}

	let {
		sectionTitle,
		label,
		addValue,
		prices,
		extraPrices = [],
		locationIdForExtraPrices = undefined,
		showExtraInfo = false,
		added,
		children = undefined
	}: Props = $props();
	function getSelectLabel(price: ListPriceWithMold): string {
		return price.description ?? price.id;
	}

	function generateMap(
		ps: ListPriceWithMold[],
		eps: ListPriceWithMold[] = []
	): Map<string, ListPriceWithMold> {
		const pm = new Map<string, ListPriceWithMold>();
		ps.forEach((p) => {
			pm.set(getId(p), p);
		});

		eps.forEach((p) => {
			pm.set(getId(p), p);
		});

		return pm;
	}

	function getId(p: ListPriceWithMold): string {
		return `${p.id}${p.moldId ? '_' + p.moldId : ''}`;
	}

	function insertElementsBeforeKey(
		originalArray: ListPriceWithMold[],
		newArray: ListPriceWithMold[],
		key: string
	): ListPriceWithMold[] {
		const keyIndex = originalArray.findIndex((p) => p.id === key);
		if (keyIndex === -1) {
			return originalArray;
		}

		return [...originalArray.slice(0, keyIndex), ...newArray, ...originalArray.slice(keyIndex)];
	}

	function getDefaultPrices(
		pi: ListPriceWithMold[],
		epi: ListPriceWithMold[],
		keyFound: boolean,
		key?: string
	): ListPriceWithMold[] {
		const defaultPrices = pi.filter((p) => p.priority > 0).sort((a, b) => b.priority - a.priority);
		if (!keyFound || key == null) {
			return [...defaultPrices, ...epi]
				.filter((p) => p.priority > 0)
				.sort((a, b) => b.priority - a.priority);
		} else {
			return insertElementsBeforeKey(defaultPrices, epi, key);
		}
	}

	function getNormalPrices(
		pi: ListPriceWithMold[],
		epi: ListPriceWithMold[],
		keyFound: boolean,
		key?: string
	): ListPriceWithMold[] {
		const normalPrices = pi.filter((p) => p.priority === 0);
		if (!keyFound || key == null) {
			return [...normalPrices, ...epi].filter((p) => p.priority === 0);
		} else {
			return insertElementsBeforeKey(normalPrices, epi, key);
		}
	}

	let selectedId: string | undefined = $state();
	let extraInfo: string | undefined = $state();
	let pricesMap: Map<string, ListPriceWithMold> = $derived(generateMap(prices, extraPrices));
	let keyFound = $derived(
		locationIdForExtraPrices !== null &&
			prices.findIndex((p) => p.id === locationIdForExtraPrices) > -1
	);
	let defaultPrices = $derived(
		getDefaultPrices(prices, extraPrices, keyFound, locationIdForExtraPrices)
	);
	let normalPrices = $derived(
		getNormalPrices(prices, extraPrices, keyFound, locationIdForExtraPrices)
	);
	let isButtonDisabled = $derived(selectedId == null);
	let canBeAdded = $derived(!showExtraInfo || (extraInfo != null && extraInfo.length > 0));

	function addFunction() {
		if (!isButtonDisabled && selectedId != null) {
			const element = pricesMap.get(selectedId)!;
			addValue(element.type, element.id, element.moldId, showExtraInfo ? extraInfo : undefined);
		}
	}
</script>

<Spacer title={sectionTitle} />
<div class="lg:col-span-2">
	<div class="flex flex-col justify-center gap-3 lg:grid lg:grid-cols-2 lg:items-end">
		<div class="flex flex-col gap-2">
			<Label for="priceId">{label}:</Label>
			<NativeSelect.Root name="priceId" bind:value={selectedId} success={added}>
				<option value=""></option>
				{#each defaultPrices as price}
					<option value={getId(price)} data-mold={price.moldId}>{getSelectLabel(price)}</option>
				{/each}
				{#each normalPrices as price}
					<option value={getId(price)} data-mold={price.moldId}>{getSelectLabel(price)}</option>
				{/each}
			</NativeSelect.Root>
		</div>

		{#if showExtraInfo}
			<div class="flex flex-col gap-2">
				<Label for="extraInfoValue">Número:</Label>
				<Input type="text" name="extraInfoValue" bind:value={extraInfo} success={added} />
			</div>
			{@render children?.()}
			<div class="w-full lg:col-span-2 lg:w-auto">
				<Button
					icon={IconType.PLUS}
					iconSize={IconSize.BIG}
					disabled={!canBeAdded}
					tooltipText={!canBeAdded ? 'Falta número' : undefined}
					text="Añadir a la lista"
					onClick={() => addFunction()}
				></Button>
			</div>
		{:else}
			{@render children?.()}
			<div class="w-full lg:w-auto">
				<Button
					icon={IconType.PLUS}
					iconSize={IconSize.BIG}
					disabled={!canBeAdded}
					text="Añadir a la lista"
					onClick={() => addFunction()}
				></Button>
			</div>
		{/if}
	</div>
</div>
