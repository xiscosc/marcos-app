<script lang="ts">
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import Button from '../button/Button.svelte';
	import WhatsAppButton from '../button/WhatsAppButton.svelte';
	import Divider from '../Divider.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';
	import { ButtonStyle } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
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
			class={`rounded-lg bg-gradient-to-r p-1 text-white ${getStatusUIInfo(OrderStatus.PICKED_UP).gradientClasses}`}
		>
			<div
				class="flex flex-row items-center justify-center space-x-3 rounded-md bg-white p-2 shadow-inner md:p-1"
			>
				<div class="flex items-center rounded-full bg-green-100 px-2 py-1 text-green-600">
					<Icon type={IconType.SENT} />
				</div>
				<h3 class="text-md font-semibold text-green-600">Cliente avisado</h3>
			</div>
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
