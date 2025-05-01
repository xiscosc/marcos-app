<script lang="ts">
	import OrderPrint from '@/components/business-related/order-detail/OrderPrint.svelte';
	import type { PageData } from './$types';
	import { OrderUtilities } from '@/shared/order.utilities';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<meta property="og:title" content="Resguardo del pedido" />
	<meta property="og:description" content={`Pedido ${data.fullOrder.order.publicId}`} />
	<meta
		property="og:image"
		content="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
	/>
	<meta property="og:url" content={OrderUtilities.getOrderPublicUrl(data.fullOrder.order)} />
	<meta property="og:type" content="website" />
</svelte:head>

<OrderPrint fullOrder={data.fullOrder} showFooter={!data.userLoggedIn} print={false}></OrderPrint>
