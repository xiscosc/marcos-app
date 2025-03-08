<script lang="ts">
	import type { PageData } from './$types';
	import { initPosthog } from '@/shared/analytics.utilities';
	import ExternalOrderPrint from '@/components/business-related/order-detail/ExternalOrderPrint.svelte';
	import { onMount } from 'svelte';
	import type { ExternalFullOrder } from '@marcsimolduressonsardina/core/type';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { OrderUtilities } from '@/shared/order.utilities';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	initPosthog(data.envName, data.user);
	let fullOrder = $state<ExternalFullOrder | undefined>(undefined);
	let notFound = $state(false);

	onMount(() => {
		if (browser) {
			const orderId = page.params.id;
			const orderString = localStorage.getItem(`order-${orderId}`);
			if (orderString) {
				const parserOrder = JSON.parse(orderString);
				fullOrder = OrderUtilities.hydrateFullOrder(parserOrder) as ExternalFullOrder;
			} else {
				notFound = true;
			}
		}
	});
</script>

{#if fullOrder}
	<ExternalOrderPrint {fullOrder} print></ExternalOrderPrint>
{:else if notFound}
	<div>No se encontró el pedido</div>
{:else}
	<div>Cargando...</div>
{/if}
