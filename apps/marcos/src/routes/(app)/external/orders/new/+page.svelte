<script lang="ts">
	import { browser } from '$app/environment';
	import { DateTime } from 'luxon';
	import type { PageProps } from './$types';
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';
	import NewExternalOrderSubmitButtons from '@/components/business-related/order-form/submit-buttons/NewExternalOrderSubmitButtons.svelte';
	import Box from '@/components/generic/Box.svelte';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';

	let { data, form }: PageProps = $props();
	let loading = $state(false);
	$effect(() => {
		if (form?.fullOrder && browser) {
			loading = true;
			if (form.fullOrder) {
				try {
					const externalFullOrder = form.fullOrder;

					// Calculate expiration date (48 hours from now) using Luxon
					const expirationDate = DateTime.now().plus({ hours: 48 }).toJSDate();
					const expires = `expires=${expirationDate.toUTCString()}`;

					// Set cookie with order data and expiration
					document.cookie = `order-${externalFullOrder.order.id}=${encodeURIComponent(JSON.stringify(externalFullOrder))}; ${expires}; path=/; SameSite=Strict`;

					// Redirect to the print page for this order

					window.location.href = `/external/orders/${externalFullOrder.order.id}/print`;
				} catch (error) {
					console.error('Failed to store order in cookie:', error);
				}
			}
		}
	});
</script>

{#if loading}
	<Box>
		<ProgressBar text="Creando nota..." />
	</Box>
{:else}
	<OrderForm data={data.orderCreationFormData} title="Crear nota" isExternal>
		<NewExternalOrderSubmitButtons />
	</OrderForm>
{/if}
