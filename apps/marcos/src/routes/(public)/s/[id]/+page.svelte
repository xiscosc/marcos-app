<script lang="ts">
	import type { PageData } from './$types';
	import OrderPrint from '$lib/components/order/OrderPrint.svelte';
	export let data: PageData;
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

<OrderPrint {order} {calculatedItem} print={false}></OrderPrint>
