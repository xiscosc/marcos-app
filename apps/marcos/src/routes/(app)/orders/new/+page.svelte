<script lang="ts">
	import type { PageData } from './$types';
	import OrderForm from '$lib/components/order/OrderForm.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm data={data.orderCreationFormData} isNew={!data.isCopy}></OrderForm>
