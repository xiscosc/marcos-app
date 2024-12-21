<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import { type CalculatedItem, type Order } from '@marcsimolduressonsardina/core/type';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';
	import CartItem from '../item/CartItem.svelte';
	import OrderPriceDetails from './OrderPriceDetails.svelte';

	interface Props {
		order: Order;
		calculatedItem: CalculatedItem;
	}

	let { order, calculatedItem }: Props = $props();
</script>

<Box title="Elementos" collapsible>
	{#if calculatedItem}
		<div class="text-md space-y-2 text-gray-700">
			{#each CalculatedItemUtilities.sortByPricingType(OrderUtilities.addPricingTypeToCalculatedParts(order.item.partsToCalculate, calculatedItem.parts)) as part}
				<CartItem {part} hideDeleteButton={true} />
			{/each}
		</div>
	{/if}
</Box>

{#if calculatedItem.quantity > 1 || calculatedItem.discount > 0}
	<OrderPriceDetails
		quantity={calculatedItem.quantity}
		discount={calculatedItem.discount}
		unitPriceWithoutDiscount={CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)}
		unitPriceWithDiscount={CalculatedItemUtilities.getUnitPriceWithDiscount(calculatedItem)}
		totalWithoutDiscount={CalculatedItemUtilities.getTotalWithoutDiscount(calculatedItem)}
		totalWithDiscount={CalculatedItemUtilities.getTotal(calculatedItem)}
		collapsed={false}
	></OrderPriceDetails>
{/if}
