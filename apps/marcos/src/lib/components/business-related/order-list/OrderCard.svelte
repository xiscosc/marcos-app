<script lang="ts">
	import { DateTime } from 'luxon';
	import { OrderUtilities } from '@/shared/order.utilities';
	import { orderStatusMap } from '@/shared/mappings/order.mapping';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '@/ui/ui.helper';
	import { OrderUtilities as CoreOrderUtilities } from '@marcsimolduressonsardina/core/util';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonStyle } from '@/components/generic/button/button.enum';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';

	interface Props {
		fullOrder: FullOrder;
		showCustomer?: boolean;
	}

	let { fullOrder, showCustomer = true }: Props = $props();
	const order = fullOrder.order;
	const calculatedItem = fullOrder.calculatedItem;
	let measures = $derived(`${order.item.height}x${order.item.width} cm`);
	let mold = $derived(OrderUtilities.getFirstMoldDescriptionFromOrder(order, calculatedItem));
</script>

{#snippet infoPiece(icon: IconType, title: string, value: string, redText: boolean = false)}
	<div class="flex flex-col">
		<div class="flex items-center gap-2 text-gray-600">
			<Icon type={icon} />
			<span>{title}</span>
		</div>
		<div class="font-semibold" class:text-red-600={redText}>
			{value}
		</div>
	</div>
{/snippet}

<div
	class="mx-auto flex w-full flex-col overflow-hidden rounded-md border border-gray-50 md:max-w-md"
>
	<div
		class={`rounded-t-md p-2 text-white ${
			getStatusUIInfoWithPaymentInfo(order.status, fullOrder.totals.payed).staticColor
		}`}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 space-x-1 rounded-lg px-3 py-1 pr-2 text-sm">
				<Icon type={getStatusUIInfo(order.status).statusIcon} />
				<span class="font-semibold">{orderStatusMap[order.status]}</span>
			</div>

			<div class="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem]">
				<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
					{order.publicId}
				</span>
			</div>
		</div>
	</div>

	<div class="flex flex-1 flex-col bg-white p-1 text-sm">
		<div class="grid flex-1 auto-rows-max grid-cols-2 items-start gap-2 p-3">
			{@render infoPiece(
				IconType.CLOCK,
				'Fecha',
				DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')
			)}

			{#if showCustomer && !CoreOrderUtilities.isOrderTemp(order)}
				{@render infoPiece(IconType.USER, 'Cliente', order.customer.name)}
			{/if}

			{#if CoreOrderUtilities.isOrderTemp(order)}
				{@render infoPiece(
					IconType.USER,
					'Cliente',
					order.status === OrderStatus.QUOTE ? 'Presupuesto sin vincular' : 'Pedido sin vincular',
					true
				)}
			{/if}

			{#if order.status !== OrderStatus.QUOTE}
				{@render infoPiece(
					IconType.TRUCK,
					'Recogida',
					order.item.instantDelivery
						? 'Al momento'
						: DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')
				)}
			{/if}

			{#if order.status !== OrderStatus.QUOTE}
				{@render infoPiece(IconType.COINS, 'Pagado', fullOrder.totals.payed ? 'Sí' : 'No')}
			{/if}

			{#if order.status === OrderStatus.FINISHED}
				{@render infoPiece(IconType.LOCATION, 'Ubicación', order.location)}
			{/if}

			{@render infoPiece(IconType.RULER, 'Medidas', measures)}

			{#if mold}
				{@render infoPiece(IconType.MOLD, 'Moldura', mold)}
			{/if}
		</div>

		<div class="text-1 m-1 rounded-md border border-gray-100 bg-gray-50 px-2 py-2">
			{order.item.description}
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex items-center justify-between bg-white p-3">
		<div>
			{#if order.status === OrderStatus.FINISHED && order.notified}
				<div
					class="flex items-center gap-2 rounded-md border border-emerald-500 bg-emerald-100 px-2 py-0.5 text-emerald-800"
				>
					<div class="flex items-center p-1">
						<Icon type={IconType.SENT} />
					</div>
					<span class="text-xs font-bold">Cliente avisado</span>
				</div>
			{/if}

			{#if CoreOrderUtilities.isOrderTemp(order)}
				<div
					class="flex items-center gap-2 rounded-md border border-red-400 bg-red-50 px-2 py-0.5 text-red-700"
				>
					<div class="flex items-center p-1">
						<Icon type={IconType.USER_PLUS} />
					</div>
					<span class="text-xs font-bold">Sin cliente</span>
				</div>
			{/if}
		</div>
		<div class="flex justify-end text-xs">
			<Button
				icon={CoreOrderUtilities.isOrderTemp(order) ? IconType.LINK : IconType.EYE}
				text={CoreOrderUtilities.isOrderTemp(order) ? `Vincular` : `Ver`}
				link={`/orders/${order.id}`}
				style={ButtonStyle.CUSTOMER}
			></Button>
		</div>
	</div>
</div>
