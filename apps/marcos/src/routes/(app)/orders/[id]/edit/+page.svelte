<script lang="ts">
	import OrderForm from '$lib/components/order/OrderForm.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm {data} isNew={false}></OrderForm>
