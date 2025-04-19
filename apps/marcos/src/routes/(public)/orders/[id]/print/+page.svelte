<script lang="ts">
	import type { PageData } from './$types';
	import { identifyUser } from '@/shared/analytics.utilities';
	import OrderPrint from '@/components/business-related/order-detail/OrderPrint.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	identifyUser(data.user, data.envName);
</script>

<OrderPrint fullOrder={data.fullOrder} print></OrderPrint>
