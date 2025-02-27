<script lang="ts">
	import type { PageData } from './$types';
	import OrderPrint from '$lib/components/order/OrderPrint.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderPrint fullOrder={data.fullOrder} print={false}></OrderPrint>
