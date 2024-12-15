<script lang="ts">
	import type { PageData } from './$types';
	import OrderPrint from '$lib/components/order/OrderPrint.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
</script>

<OrderPrint {order} {calculatedItem} print={true}></OrderPrint>
