<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';
	import NewExternalOrderSubmitButtons from '@/components/business-related/order-form/submit-buttons/NewExternalOrderSubmitButtons.svelte';
	import Box from '@/components/generic/Box.svelte';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';

	let { data, form }: PageProps = $props();
	let loading = $state(false);
	let reference = $state('');
	$effect(() => {
		if (form?.fullOrder && browser) {
			loading = true;
			if (form.fullOrder) {
				try {
					const externalFullOrder = form.fullOrder;
					externalFullOrder.order.reference = reference;
					localStorage.setItem(
						`order-${externalFullOrder.order.id}`,
						JSON.stringify(externalFullOrder)
					);
					goto(`/external/orders/${externalFullOrder.order.id}/print`);
				} catch (error) {
					console.error('Failed to store order in localStorage:', error);
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
	<OrderForm data={data.orderCreationFormData} title="Crear nota">
		<NewExternalOrderSubmitButtons bind:reference />
	</OrderForm>
{/if}
