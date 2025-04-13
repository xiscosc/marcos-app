<script lang="ts">
	import type { PageData } from './$types';

	import { IconType } from '@/components/generic/icon/icon.enum';
	import OrderList from '@/components/business-related/order-list/OrderList.svelte';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import { getGlobalProfiler } from '@/stores/profiler.store';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const orderTypeName = data.showQuotes ? 'Presupuestos' : 'Pedidos';
	let measuredOrders = $derived(getGlobalProfiler().measure(data.orders));
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER}>
		{orderTypeName} de {data.customer?.name}
	</SimpleHeading>

	<OrderList promiseOrders={measuredOrders} />
</div>
