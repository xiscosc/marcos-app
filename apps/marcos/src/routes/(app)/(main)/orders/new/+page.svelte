<script lang="ts">
	import NewOrderSubmitButtons from '@/components/business-related/order-form/submit-buttons/NewOrderSubmitButtons.svelte';
	import type { PageData } from './$types';
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm
	data={data.orderCreationFormData}
	title="Nuevo Pedido / Presupuesto"
	isNew={!data.isCopy}
>
	<NewOrderSubmitButtons />
</OrderForm>
