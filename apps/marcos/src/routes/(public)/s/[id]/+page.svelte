<script lang="ts">
	import OrderPrint from '@/components/business-related/order-detail/OrderPrint.svelte';
	import type { PageData } from './$types';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderPrint fullOrder={data.fullOrder} print={false}></OrderPrint>
