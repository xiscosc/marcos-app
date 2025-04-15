<script lang="ts">
	import * as Form from '@/components/ui/form/index.js';
	import * as NativeSelect from '@/components/ui/native-select/index.js';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import { ButtonAction, ButtonText } from '@/components/generic/button/button.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { OrderActionNames, orderStatusMap } from '@/shared/mappings/order.mapping';
	import { OrderUtilities } from '@/shared/order.utilities';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '@/ui/ui.helper';
	import Divider from '@/components/generic/Divider.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import BottomSheetLoading from '@/components/generic/BottomSheetLoading.svelte';
	import type { StatusOrderSchema } from '@/shared/form-schema/order.form-schema';
	import { getGlobalProfiler } from '@/state/profiler/profiler.state';

	interface Props {
		data: SuperValidated<Infer<StatusOrderSchema>>;
		locations: string[];
		fullOrder: FullOrder;
	}

	let { data, locations, fullOrder }: Props = $props();
	const form = superForm(data, {
		onSubmit: async ({ formData }) => {
			await getGlobalProfiler().measureStandalone();
			formData.set('status', newStatus ?? '');
		}
	});

	const { form: formData, enhance, submitting } = form;

	function triggerForm(status: OrderStatus) {
		newStatus = status;
		form.submit();
	}

	let newStatus = $state<OrderStatus>();
	const statuses = OrderUtilities.getPossibleNextStatuses(fullOrder.order.status);
	const order = fullOrder.order;
</script>

<BottomSheet
	title="Cambiar estado"
	description="Seleccione el nuevo estado del pedido"
	iconType={getStatusUIInfo(order.status).statusIcon}
	triggerStyle={getStatusUIInfoWithPaymentInfo(order.status, fullOrder.totals.payed, true).colors}
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
		<form
			method="POST"
			use:enhance
			action={`?/${OrderActionNames.CHANGE_STATUS}`}
			class="flex flex-col gap-2"
		>
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
			{/if}
		</form>
	{/snippet}
</BottomSheet>
