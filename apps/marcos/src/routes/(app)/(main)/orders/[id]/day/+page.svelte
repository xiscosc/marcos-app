<script lang="ts">
	import type { PageData } from './$types';
	import OrderCard from '@/components/business-related/order-list/OrderCard.svelte';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import { OrderUtilities } from '@/shared/order.utilities';
	import WhatsAppButton from '@/components/business-related/button/WhatsAppButton.svelte';
	import Banner from '@/components/generic/Banner.svelte';
	import { getStatusUIInfo } from '@/ui/ui.helper';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';

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
		<SimpleHeading icon={IconType.DAY}>
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
				color={getStatusUIInfo(OrderStatus.PICKED_UP).bannerColor}
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
