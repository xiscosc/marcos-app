<script lang="ts">
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm {data} isNew={false}></OrderForm>
