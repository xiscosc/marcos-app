<script lang="ts">
	import Box from '../Box.svelte';
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		quantity: number;
		discount: number;
		unitPriceWithoutDiscount: number;
		unitPriceWithDiscount: number;
		totalWithoutDiscount: number;
		totalWithDiscount: number;
	}

	let {
		quantity,
		discount,
		unitPriceWithoutDiscount,
		unitPriceWithDiscount,
		totalWithoutDiscount,
		totalWithDiscount
	}: Props = $props();
</script>

{#snippet priceDetail(iconType: IconType, text: string, isTotal = false)}
	<div class="flex flex-row items-center justify-start gap-2">
		<span
			class="flex flex-row items-center gap-1 rounded-sm border bg-gray-800 p-2 text-white shadow-sm"
		>
			<Icon type={iconType} />
		</span>
		<span class="text-md font-medium" class:text-xl={isTotal} class:font-semibold={isTotal}
			>{text}</span
		>
	</div>
{/snippet}

<Box title="Detalles del precio" collapsible={true}>
	<div class="flex flex-col gap-2">
		{#if quantity > 1}
			{@render priceDetail(IconType.ORDER_DEFAULT, `${quantity} unidades`)}
		{/if}
		{#if discount > 0}
			{@render priceDetail(IconType.DISCOUNT, `${discount}% descuento aplicado`)}
		{/if}
		{#if quantity > 1}
			{@render priceDetail(IconType.TICKET, `${unitPriceWithoutDiscount.toFixed(2)}€ por unidad`)}
			{#if discount > 0}
				{@render priceDetail(
					IconType.TICKET_DISCOUNT,
					`${unitPriceWithDiscount.toFixed(2)}€ por unidad con descuento`
				)}
			{/if}
		{/if}

		{#if discount > 0}
			{@render priceDetail(
				IconType.ORDER_QUOTE,
				`${totalWithoutDiscount.toFixed(2)}€ total sin descuento`
			)}
		{/if}

		{@render priceDetail(
			IconType.COINS,
			`${totalWithDiscount.toFixed(2)}€ total`,
			discount > 0 || quantity > 1
		)}
	</div>
</Box>
