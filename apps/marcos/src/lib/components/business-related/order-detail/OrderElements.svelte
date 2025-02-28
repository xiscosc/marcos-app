<script lang="ts">
	import Box from '@/components/generic/Box.svelte';
	import { type FullOrder } from '@marcsimolduressonsardina/core/type';
	import CartItem from '@/components/business-related/order/CartItem.svelte';

	interface Props {
		fullOrder: FullOrder;
	}

	let { fullOrder }: Props = $props();
</script>

<Box title="Elementos" collapsible>
	<div class="flex flex-col gap-2">
		<div class="text-md space-y-2 text-gray-700">
			{#each fullOrder.calculatedItem.parts as part}
				<CartItem
					{part}
					hideDeleteButton={true}
					showNoDiscountAllowed={fullOrder.calculatedItem.discount > 0}
				/>
			{/each}
		</div>
		{#if fullOrder.totals.discountNotAllowedPresent}
			<span class="text-xs text-gray-500">* Elementos con descuento no permitido</span>
		{/if}
	</div>
</Box>
