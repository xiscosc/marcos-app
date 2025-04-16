<script lang="ts">
	import Box from '@/components/generic/Box.svelte';

	import { OrderUtilities } from '@/shared/order.utilities';
	import type { PageData } from './$types';

	import { OrderStatus } from '@marcsimolduressonsardina/core/type';
	import WhatsAppButton from '@/components/business-related/button/WhatsAppButton.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { getStatusUIInfo } from '@/ui/ui.helper';
	import Banner from '@/components/generic/Banner.svelte';
	import { ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
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

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.SENT}>Mensaje de finalizado</SimpleHeading>
	{#if data.order}
		{#if data.order.status === OrderStatus.FINISHED}
			{#if data.orderCounters.totalCount > 1}
				<Box>
					<div class="flex flex-col gap-2">
						{#if data.orderCounters.pendingCount > 0}
							<Banner
								icon={IconType.ALERT}
								color={getStatusUIInfo(OrderStatus.PENDING).bannerColor}
								title="Hay pedidos pendientes"
								text="Tienes pedidos pendientes del mismo día. Puedes enviar el mensaje de finalizado
										de este pedido o revisar los otros pedidos del día."
							></Banner>
						{:else}
							<Banner
								icon={IconType.ALERT}
								color={getStatusUIInfo(OrderStatus.FINISHED).bannerColor}
								title="Todos los pedidos del día están finalizados"
								text=""
							></Banner>
						{/if}
						{#if data.order.notified || whatsAppNotified}
							<Banner
								icon={IconType.SENT}
								color={getStatusUIInfo(OrderStatus.PICKED_UP).bannerColor}
								title="Cliente avisado"
								text=""
							></Banner>
						{/if}

						<div class="flex flex-col gap-2 lg:flex-row">
							<Button
								icon={IconType.ORDER_DEFAULT}
								text="Ver pedidos del día"
								style={ButtonStyle.ORDER_GENERIC}
								textType={ButtonText.GRAY}
								link={`/orders/${data.order.id}/day`}
							></Button>

							<WhatsAppButton
								label="Enviar mensaje finalizado"
								message={OrderUtilities.getWhatsappFinishedText([data.order])}
								customer={data.order.customer}
								{handleAfterNotify}
								notifyOrder={true}
								orders={[data.order]}
							></WhatsAppButton>
						</div>
					</div>
				</Box>
			{/if}
		{/if}
	{/if}
</div>
