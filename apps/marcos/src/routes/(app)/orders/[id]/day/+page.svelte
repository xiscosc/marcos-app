<script lang="ts">
	import type { PageData } from './$types';
	import OrderCard from '$lib/components/order/OrderCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let whatsAppNotified = $state(false);

	function handleAfterNotify() {
		whatsAppNotified = true;
	}
</script>

<div class="space flex w-full flex-col gap-4">
	{#await data.orders}
		<ProgressBar text={'Cargando pedidos del día'} />
	{:then fullOrders}
		<SimpleHeading icon={IconType.ORDER_DEFAULT}>
			<div class="flex flex-col lg:flex-row lg:gap-2">
				<span>Pedidos del mismo día</span>
				<span class="text-gray-600">{fullOrders[0].order.customer.name}</span>
			</div>
		</SimpleHeading>
		<div class="flex w-full flex-col place-content-center items-center justify-center gap-2">
			<WhatsAppButton
				label="Enviar mensaje todos finalizados"
				message={OrderUtilities.getWhatsappFinishedText(
					fullOrders
						.map((fullOrder) => fullOrder.order)
						.filter((order) => order.status === OrderStatus.FINISHED)
				)}
				customer={fullOrders[0].order.customer}
				tooltipText="Hay pedidos pendientes"
				notifyOrder={true}
				{handleAfterNotify}
				orders={fullOrders
					.map((fullOrder) => fullOrder.order)
					.filter((order) => order.status === OrderStatus.FINISHED)}
				disabled={fullOrders.filter(
					(fullOrder) =>
						fullOrder.order.status === OrderStatus.FINISHED ||
						fullOrder.order.status === OrderStatus.PICKED_UP
				).length !== fullOrders.length}
			></WhatsAppButton>
		</div>

		{#if whatsAppNotified}
			<Banner
				icon={IconType.SENT}
				colorName={getStatusUIInfo(OrderStatus.PICKED_UP).colorName}
				title="Cliente avisado"
				text="El mensaje de finalizado se ha enviado para todos los pedidos"
			></Banner>
		{/if}

		<div class="flex w-full flex-col gap-3 lg:grid lg:grid-cols-4">
			{#each fullOrders as fullOrder (fullOrder.order.id)}
				<OrderCard {fullOrder} showCustomer={false} />
			{/each}
		</div>
	{/await}
</div>
