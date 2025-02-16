<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as NativeSelect from '$lib/components/ui/native-select/index.js';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonText } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import {
		orderStatusMap,
		OrderUtilities,
		type StatusOrderSchema
	} from '$lib/shared/order.utilities';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';
	import Divider from '$lib/components/Divider.svelte';
	import {
		OrderStatus,
		type CalculatedItem,
		type Order
	} from '@marcsimolduressonsardina/core/type';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';
	import BottomSheetLoading from '$lib/components/BottomSheetLoading.svelte';
	import { IconType } from '@/components/icon/icon.enum';
	import { closeBottomSheet } from '@/stores/bottomSheet.svelte';
	interface Props {
		data: SuperValidated<Infer<StatusOrderSchema>>;
		locations: string[];
		order: Order;
		calculatedItem: CalculatedItem;
	}

	let { data, locations, order, calculatedItem }: Props = $props();
	const form = superForm(data, {
		onSubmit({ formData }) {
			formData.set('status', newStatus ?? '');
		},
		onResult() {
			closeBottomSheet();
		}
	});

	const { form: formData, enhance, submitting } = form;

	function triggerForm(status: OrderStatus) {
		newStatus = status;
		form.submit();
	}

	let newStatus = $state<OrderStatus>();
	const statuses = OrderUtilities.getPossibleNextStatuses(order.status);
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	const payed = order.amountPayed === totalOrder;
</script>

<BottomSheet
	title="Cambiar estado"
	description="Seleccione el nuevo estado del pedido"
	iconType={getStatusUIInfo(order.status).statusIcon}
	triggerStyle={getStatusUIInfoWithPaymentInfo(order.status, payed, true).colors}
	triggerTextType={ButtonText.NO_COLOR}
>
	{#snippet trigger()}
		<Button
			text="Estado: {orderStatusMap[order.status]}"
			icon={getStatusUIInfo(order.status).statusIcon}
			action={ButtonAction.TRIGGER}
		></Button>
	{/snippet}

	{#snippet action()}
		<form method="POST" use:enhance action="?/changeOrderStatus" class="flex flex-col gap-2">
			{#if $submitting}
				<BottomSheetLoading />
			{:else}
				{#if statuses.includes(OrderStatus.FINISHED)}
					<Form.Field {form} name="location">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Nueva ubicación:</Form.Label>
								<NativeSelect.Root name={props.name} bind:value={$formData.location}>
									<option></option>
									{#each locations as l}
										<option value={l}>{l}</option>
									{/each}
								</NativeSelect.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Button
						action={ButtonAction.CLICK}
						onClick={() => triggerForm(OrderStatus.FINISHED)}
						textType={ButtonText.NO_COLOR}
						text="Cambiar a {orderStatusMap[OrderStatus.FINISHED]}"
						icon={getStatusUIInfo(OrderStatus.FINISHED).statusIcon}
						style={getStatusUIInfo(OrderStatus.FINISHED, true).colors}
					></Button>
					<Divider hideOnDesktop={false}></Divider>
				{/if}

				{#if statuses.includes(OrderStatus.PICKED_UP)}
					<Button
						action={ButtonAction.CLICK}
						textType={ButtonText.NO_COLOR}
						onClick={() => triggerForm(OrderStatus.PICKED_UP)}
						text="Cambiar a {orderStatusMap[OrderStatus.PICKED_UP]}"
						icon={getStatusUIInfo(OrderStatus.PICKED_UP).statusIcon}
						style={getStatusUIInfo(OrderStatus.PICKED_UP, true).colors}
					></Button>
				{/if}

				{#if statuses.includes(OrderStatus.PENDING)}
					<Button
						action={ButtonAction.CLICK}
						textType={ButtonText.NO_COLOR}
						onClick={() => triggerForm(OrderStatus.PENDING)}
						text="Cambiar a {orderStatusMap[OrderStatus.PENDING]}"
						icon={getStatusUIInfo(OrderStatus.PENDING).statusIcon}
						style={getStatusUIInfo(OrderStatus.PENDING, true).colors}
					></Button>
				{/if}

				<Button text="Guardar" icon={IconType.EDIT} action={ButtonAction.SUBMIT}></Button>
			{/if}
		</form>
	{/snippet}
</BottomSheet>
