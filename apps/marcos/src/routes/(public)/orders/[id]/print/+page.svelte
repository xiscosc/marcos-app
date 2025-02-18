<script lang="ts">
	import type { PageData } from './$types';
	import OrderPrint from '$lib/components/order/OrderPrint.svelte';
	import { identifyUser } from '@/shared/analytics.utilities';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	identifyUser(data.user);
	const order = data.order!;
	const calculatedItem = data.calculatedItem!;
</script>

<OrderPrint {order} {calculatedItem} print></OrderPrint>
