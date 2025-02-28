<script lang="ts">
	import * as Table from '@/components/ui/table/index.js';
	import {
		PricingType,
		type ListPrice,
		type MaxArea,
		type MaxAreaM2,
		type PricingFormula
	} from '@marcsimolduressonsardina/core/type';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { goto } from '$app/navigation';
	import { fitFormulas } from '@marcsimolduressonsardina/core/util';
	import { formulasMap } from '@/shared/mappings/pricing.mapping';

	interface Props {
		prices: ListPrice[];
		selectedType: PricingType;
	}

	let { prices, selectedType }: Props = $props();

	function getPriceLabel(
		price: number,
		formula: PricingFormula,
		areas: (MaxArea | MaxAreaM2)[]
	): string {
		if (fitFormulas.includes(formula)) {
			const prices = areas.map((a) => a.price);
			const max = Math.max(...prices);
			const min = Math.min(...prices);
			return `${min.toFixed(2)} - ${max.toFixed(2)} €`;
		} else {
			return price.toFixed(2) + ' €';
		}
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px]">ID</Table.Head>
			<Table.Head>Descripción</Table.Head>
			<Table.Head>Precio</Table.Head>
			<Table.Head>Fórmula</Table.Head>
			<Table.Head class="text-right"></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each prices as price}
			<Table.Row>
				<Table.Cell class="font-medium">{price.id}</Table.Cell>
				<Table.Cell>
					{price.description}
					{selectedType === PricingType.MOLD && price.floating ? ' (Flotante)' : ''}
				</Table.Cell>
				<Table.Cell
					>{getPriceLabel(price.price, price.formula, [
						...price.areas,
						...price.areasM2
					])}</Table.Cell
				>
				<Table.Cell
					>{selectedType === PricingType.MOLD
						? 'Marco / Moldura'
						: formulasMap[price.formula]}</Table.Cell
				>
				<Table.Cell class="text-right">
					<button type="button" onclick={() => goto(`/config/prices/${price.internalId}`)}>
						<Icon type={IconType.EDIT}></Icon>
					</button>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
