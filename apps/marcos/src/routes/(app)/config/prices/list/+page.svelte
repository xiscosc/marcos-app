<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { pricingTypesMap } from '$lib/shared/mappings/pricing.mapping';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/button/Button.svelte';
	import { ButtonStyle, ButtonType } from '$lib/components/button/button.enum';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import Box from '$lib/components/Box.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import PriceTable from '$lib/components/price/PriceTable.svelte';
	import { PricingType, type AllPrices, type ListPrice } from '@marcsimolduressonsardina/core/type';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let selectedType: PricingType = $state(data.pricingType);

	function sortPricing(priceList: ListPrice[]): ListPrice[] {
		return priceList.sort((a, b) => b.priority - a.priority);
	}

	function getPricingListByType(pricing: AllPrices, type: PricingType): ListPrice[] {
		switch (type) {
			case PricingType.GLASS:
				return sortPricing(pricing.glassPrices);
			case PricingType.BACK:
				return sortPricing(pricing.backPrices);
			case PricingType.PP:
				return sortPricing(pricing.ppPrices);
			case PricingType.OTHER:
				return sortPricing(pricing.otherPrices);
			case PricingType.LABOUR:
				return sortPricing(pricing.labourPrices);
			case PricingType.TRANSPORT:
				return sortPricing(pricing.transportPrices);
			case PricingType.HANGER:
				return sortPricing(pricing.hangerPrices);
			case PricingType.MOLD:
				return sortPricing(pricing.moldPrices);
			default:
				return [];
		}
	}
</script>

<div class="flex w-full flex-col gap-4">
	<SimpleHeading icon={IconType.LIST}>
		<div class="flex flex-row items-center gap-2">
			<span>Listado de precios </span>
			<Button
				icon={IconType.PLUS}
				text=""
				buttonType={ButtonType.SMALL}
				style={ButtonStyle.NEUTRAL}
				onClick={() => goto('/config/prices/new')}
			></Button>
		</div>
	</SimpleHeading>
	{#await data.pricing}
		<Box>
			<ProgressBar text={'Cargando precios'} />
		</Box>
	{:then pricing}
		<Box>
			<Tabs.Root bind:value={selectedType} class="flex w-full flex-col">
				<Tabs.List>
					<Tabs.Trigger value={PricingType.MOLD}>Marco</Tabs.Trigger>
					<Tabs.Trigger value={PricingType.OTHER}>{pricingTypesMap[PricingType.OTHER]}</Tabs.Trigger
					>
					<Tabs.Trigger value={PricingType.BACK}>{pricingTypesMap[PricingType.BACK]}</Tabs.Trigger>
					<Tabs.Trigger value={PricingType.GLASS}>{pricingTypesMap[PricingType.GLASS]}</Tabs.Trigger
					>
					<Tabs.Trigger value={PricingType.PP}>{pricingTypesMap[PricingType.PP]}</Tabs.Trigger>
					<Tabs.Trigger value={PricingType.LABOUR}>
						{pricingTypesMap[PricingType.LABOUR]}
					</Tabs.Trigger>
					<Tabs.Trigger value={PricingType.TRANSPORT}>
						{pricingTypesMap[PricingType.TRANSPORT]}
					</Tabs.Trigger>
					<Tabs.Trigger value={PricingType.HANGER}>
						{pricingTypesMap[PricingType.HANGER]}
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="account">Make changes to your account here.</Tabs.Content>
				<Tabs.Content value="password">Change your password here.</Tabs.Content>
			</Tabs.Root>

			<PriceTable prices={getPricingListByType(pricing, selectedType)} {selectedType}></PriceTable>
		</Box>
	{:catch error}
		<p>{error.message}</p>
	{/await}
</div>
