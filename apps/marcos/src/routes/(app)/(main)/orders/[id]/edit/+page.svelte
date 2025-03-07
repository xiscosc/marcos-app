<script lang="ts">
	import OrderForm from '@/components/business-related/order-form/OrderForm.svelte';
	import type { PageData } from './$types';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';
	import EditOrderSubmitButtons from '@/components/business-related/order-form/submit-buttons/EditOrderSubmitButtons.svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<OrderForm
	{data}
	isNew={false}
	title={data.editingStatus === OrderStatus.QUOTE ? 'Editar presupuesto' : 'Editar pedido'}
>
	<EditOrderSubmitButtons orderStatus={data.editingStatus} />
</OrderForm>
