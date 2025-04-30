<script lang="ts">
	import { CustomerUtilites } from '@/shared/customer.utilities';
	import type { Customer, Order } from '@marcsimolduressonsardina/core/type';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonAction, ButtonStyle } from '@/components/generic/button/button.enum';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { trackEvent } from '@/shared/analytics.utilities';

	interface Props {
		label: string;
		message: string;
		customer: Customer;
		disabled?: boolean;
		orders?: Order[];
		notifyOrder?: boolean;
		tooltipText?: string | undefined;
		handleAfterNotify?: () => void;
	}

	let {
		label = $bindable(),
		message,
		customer,
		disabled = false,
		orders = [],
		notifyOrder = false,
		tooltipText = undefined,
		handleAfterNotify = () => {}
	}: Props = $props();

	async function handleNotify() {
		if (orders.length === 0) {
			return;
		}

		const tempLabel = label;
		label = 'Cargando...';
		const promises = orders.map((order) => notifySingleOrder(order.id));
		await Promise.all(promises);
		label = `${tempLabel}`;

		const newWindowUrl = CustomerUtilites.getWhatsappLink(customer, message);
		window.open(newWindowUrl, '_blank');
		orders.forEach((order) => {
			order.notified = true;
		});

		handleAfterNotify();
	}

	async function notifySingleOrder(orderId: string) {
		fetch(`/api/orders/${orderId}/notify`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});
	}

	function trackWhatsAppClicked() {
		trackEvent('WhatsApp clicked', { action: label, customerId: customer.id });
	}
</script>

{#if notifyOrder && !disabled}
	<Button icon={IconType.WHATSAPP} text={label} style={ButtonStyle.WHATSAPP} onClick={handleNotify}
	></Button>
{:else}
	<Button
		icon={IconType.WHATSAPP}
		action={ButtonAction.LINK}
		trackFunction={trackWhatsAppClicked}
		newWindow={true}
		text={label}
		style={ButtonStyle.WHATSAPP}
		{disabled}
		{tooltipText}
		link={CustomerUtilites.getWhatsappLink(customer, message)}
	></Button>
{/if}
