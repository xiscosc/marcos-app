<script lang="ts">
	import Box from '@/components/generic/Box.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import OrderInfoStep from '@/components/business-related/order-detail/OrderInfoStep.svelte';

	interface Props {
		quantity: number;
		discount: number;
		unitPriceWithoutDiscount: number;
		unitPriceWithDiscount: number;
		totalWithoutDiscount: number;
		totalWithDiscount: number;
		collapsed?: boolean;
		alertItemsWitouthDiscount?: boolean;
	}

	let {
		quantity,
		discount,
		unitPriceWithoutDiscount,
		unitPriceWithDiscount,
		totalWithoutDiscount,
		totalWithDiscount,
		collapsed = true,
		alertItemsWitouthDiscount = false
	}: Props = $props();
</script>

{#snippet total()}
	<OrderInfoStep
		iconType={IconType.COINS}
		title="Total"
		value={`${totalWithDiscount.toFixed(2)}€`}
	/>
{/snippet}

{#if discount > 0 || quantity > 1}
	<Box title="Detalles del precio" collapsible {collapsed} nonCollapsibleContent={total}>
		<div class="flex flex-col gap-2">
			{#if quantity > 1}
				<OrderInfoStep
					iconType={IconType.ORDER_DEFAULT}
					title="Unidades"
					value={quantity.toString()}
				/>
			{/if}
			{#if discount > 0}
				<OrderInfoStep
					iconType={IconType.DISCOUNT}
					title="Descuento aplicado"
					value={`${discount}%`}
				/>
				{#if alertItemsWitouthDiscount}
					<OrderInfoStep
						iconType={IconType.ALERT}
						title="Aviso sobre el descuento"
						value="El pedido incluye elementos que no permiten descuento"
					/>
				{/if}
			{/if}
			{#if quantity > 1}
				<OrderInfoStep
					iconType={IconType.TICKET}
					title={`Precio por unidad ${discount > 0 ? 'sin descuento' : ''}`}
					value={`${unitPriceWithoutDiscount.toFixed(2)}€`}
				/>
				{#if discount > 0}
					<OrderInfoStep
						iconType={IconType.TICKET_DISCOUNT}
						title="Precio por unidad con descuento"
						value={`${unitPriceWithDiscount.toFixed(2)}€`}
					/>
				{/if}
			{/if}

			{#if discount > 0}
				<OrderInfoStep
					iconType={IconType.ORDER_QUOTE}
					title="Total sin descuento"
					value={`${totalWithoutDiscount.toFixed(2)}€`}
				/>
			{/if}
		</div>
	</Box>
{:else}
	<Box title="Detalles del precio" children={total} />
{/if}
