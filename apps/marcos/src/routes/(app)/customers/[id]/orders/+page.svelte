<script lang="ts">
	import type { PageData } from './$types';

	import { IconType } from '$lib/components/icon/icon.enum';
	import OrderList from '$lib/components/order/OrderList.svelte';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const orderTypeName = data.showQuotes ? 'Presupuestos' : 'Pedidos';
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER}>
		{orderTypeName} de {data.customer?.name}
	</SimpleHeading>

	<OrderList promiseOrders={data.orders} />
</div>
