<script lang="ts">
	import { DateTime } from 'luxon';
	import { OrderUtilities, orderStatusMap } from '$lib/shared/order.utilities';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';
	import {
		CalculatedItemUtilities,
		OrderUtilities as CoreOrderUtilities
	} from '@marcsimolduressonsardina/core/util';
	import Button from '../button/Button.svelte';
	import { ButtonStyle } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';

	interface Props {
		fullOrder: FullOrder;
		showCustomer?: boolean;
	}

	let { fullOrder, showCustomer = true }: Props = $props();
	const order = fullOrder.order;
	const calculatedItem = fullOrder.calculatedItem;
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	const payed = order.amountPayed === totalOrder;
</script>

<div
	class="mx-auto flex w-full flex-col overflow-hidden rounded-md border border-gray-300 md:max-w-md"
>
	<div
		class={`rounded-t-md p-2 text-white ${
			getStatusUIInfoWithPaymentInfo(order.status, payed).staticColor
		}`}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 space-x-1 rounded-lg px-3 py-1 pr-2 text-sm">
				<Icon type={getStatusUIInfo(order.status).statusIcon} />
				<span class="font-semibold">{orderStatusMap[order.status]}</span>
			</div>

			<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
				<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
					{OrderUtilities.getOrderPublicId(order)}
				</span>
			</div>
		</div>
	</div>

	<div class="flex flex-1 flex-col bg-white p-1 text-sm">
		<div class="flex flex-1 flex-row justify-between">
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.CLOCK} />
						<span>Fecha</span>
					</div>
					<div class="font-semibold">
						{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}
					</div>
				</div>

				{#if showCustomer && !CoreOrderUtilities.isOrderTemp(order)}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.USER} />
							<span>Cliente</span>
						</div>
						<div class="font-semibold">
							{order.customer.name}
						</div>
					</div>
				{/if}

				{#if CoreOrderUtilities.isOrderTemp(order)}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.USER} />
							<span>Cliente</span>
						</div>
						<div class="text-red-600' font-semibold">
							{order.status === OrderStatus.QUOTE
								? 'Presupuesto sin vincular'
								: 'Pedido sin vincular'}
						</div>
					</div>
				{/if}

				{#if order.status !== OrderStatus.QUOTE}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.TRUCK} />
							<span>Recogida</span>
						</div>
						<div class="font-semibold">
							{#if order.item.instantDelivery}
								Al momento
							{:else}
								{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
							{/if}
						</div>
					</div>
				{/if}
			</div>
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.COINS} />
						<span>Pagado</span>
					</div>
					<div class="font-semibold">
						{#if payed}
							Sí
						{:else}
							No
						{/if}
					</div>
				</div>
				{#if order.status === OrderStatus.FINISHED}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.LOCATION} />
							<span>Ubicación</span>
						</div>
						<div class="font-semibold">
							{order.location.length === 0 ? 'Sin ubicación' : order.location}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="text-1 m-1 rounded-md border border-gray-300 bg-neutral-50 px-2 py-2">
			{order.item.description}
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex items-center justify-between border-t border-gray-300 bg-neutral-50 p-3">
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
