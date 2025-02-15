<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import {
		type CalculatedItem,
		type CalculatedItemPart,
		type Order
	} from '@marcsimolduressonsardina/core/type';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';
	import CartItem from '../item/CartItem.svelte';

	interface Props {
		order: Order;
		calculatedItem: CalculatedItem;
		discountNotAllowedPresent: boolean;
	}

	let { order, calculatedItem, discountNotAllowedPresent }: Props = $props();

	const parts = $derived<CalculatedItemPart[]>(
		CalculatedItemUtilities.sortByPricingType(
			OrderUtilities.addPricingTypeToCalculatedParts(
				order.item.partsToCalculate,
				calculatedItem.parts
			)
		)
	);
</script>

<Box title="Elementos" collapsible>
	<div class="flex flex-col gap-2">
		<div class="text-md space-y-2 text-gray-700">
			{#each parts as part}
				<CartItem
					{part}
					hideDeleteButton={true}
					showNoDiscountAllowed={calculatedItem.discount > 0}
				/>
			{/each}
		</div>
		{#if discountNotAllowedPresent}
			<span class="text-xs text-gray-500">* Elementos con descuento no permitido</span>
		{/if}
	</div>
</Box>
