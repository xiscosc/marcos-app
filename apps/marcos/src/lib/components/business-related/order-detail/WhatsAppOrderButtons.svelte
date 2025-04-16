<script lang="ts">
	import { OrderUtilities } from '@/shared/order.utilities';
	import Button from '@/components/generic/button/Button.svelte';
	import WhatsAppButton from '@/components/business-related/button/WhatsAppButton.svelte';
	import Divider from '@/components/generic/Divider.svelte';
	import { OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';
	import { ButtonStyle } from '@/components/generic/button/button.enum';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import type { ISameDayOrderCounters } from '@marcsimolduressonsardina/core/service';

	export let order: Order;
	export let counters: ISameDayOrderCounters;
	export let hasFiles: Boolean;
	let whatsAppNotified = false;

	function handleAfterNotify() {
		whatsAppNotified = true;
	}
</script>

<Divider></Divider>
{#if order.status === OrderStatus.QUOTE}
	<WhatsAppButton
		label="Enviar presupuesto"
		message={OrderUtilities.getWhatsappQuoteText(order)}
		customer={order.customer}
		tooltipText="Faltan fotos"
		disabled={!hasFiles}
	></WhatsAppButton>
{:else}
	<WhatsAppButton
		label="Enviar resguardo"
		message={OrderUtilities.getWhatsappTicketText(order)}
		customer={order.customer}
		tooltipText="Faltan fotos"
		disabled={!hasFiles}
	></WhatsAppButton>
{/if}
{#if order.status === OrderStatus.FINISHED}
	{#if order.notified || whatsAppNotified}
		<div
			class="flex w-full flex-row items-center justify-center gap-2 rounded-sm border-2 border-green-700 bg-white py-1"
		>
			<div class="flex items-center rounded-full bg-green-100 px-2 py-1 text-green-700">
				<Icon type={IconType.SENT} />
			</div>
			<span class="text-md font-semibold text-green-700">Cliente avisado</span>
		</div>
	{/if}
	{#if counters.totalCount === 1}
		<WhatsAppButton
			label="Enviar mensaje finalizado"
			message={OrderUtilities.getWhatsappFinishedText([order])}
			customer={order.customer}
			notifyOrder={true}
			{handleAfterNotify}
			orders={[order]}
			tooltipText="Faltan fotos"
			disabled={!hasFiles}
		></WhatsAppButton>
	{:else}
		<Button
			icon={IconType.WHATSAPP}
			text={'Enviar mensaje finalizado'}
			tooltipText={'Faltan fotos'}
			link={`/orders/${order.id}/whatsapp`}
			style={ButtonStyle.WHATSAPP}
			disabled={!hasFiles}
		></Button>
	{/if}
{/if}
