<script lang="ts">
	import type { PageData } from './$types';
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm data={data.orderCreationFormData} isNew={!data.isCopy}></OrderForm>
