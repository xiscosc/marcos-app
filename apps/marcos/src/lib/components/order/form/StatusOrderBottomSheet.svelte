<script lang="ts">
	import { enhance as sEnhance } from '$app/forms';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonText } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import {
		locationOrderSchema,
		orderStatusMap,
		OrderUtilities,
		type LocationOrderSchema
	} from '$lib/shared/order.utilities';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';
	import Divider from '$lib/components/Divider.svelte';
	import {
		OrderStatus,
		type CalculatedItem,
		type Order
	} from '@marcsimolduressonsardina/core/type';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';

	interface Props {
		data: SuperValidated<Infer<LocationOrderSchema>>;
		locations: string[];
		order: Order;
		calculatedItem: CalculatedItem;
	}

	let { data, locations, order, calculatedItem }: Props = $props();
	const form = superForm(data, {
		validators: zodClient(locationOrderSchema),
		id: 'status-location-order-form'
	});

	const { form: formData, enhance, submitting, errors } = form;
	let formLoading = $state(false);
	let classicFormLoading = $state(false);
	const statuses = OrderUtilities.getPossibleNextStatuses(order.status);

	$effect(() => {
		if ($submitting) {
			formLoading = true;
		}

		if ($errors.location) {
			formLoading = false;
		}
	});

	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
	const payed = order.amountPayed === totalOrder;
</script>

{#snippet sheetTrigger()}
	<Button
		text="Estado: {orderStatusMap[order.status]}"
		icon={getStatusUIInfo(order.status).statusIcon}
		action={ButtonAction.TRIGGER}
	></Button>
{/snippet}

{#snippet changeToFinished()}
	<form method="POST" use:enhance action="?/saveLocation" class="flex flex-col gap-2">
		<Form.Field {form} name="location">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Nueva ubicación:</Form.Label>
					<Select.Root type="single" bind:value={$formData.location} name={props.name}>
						<Select.Trigger {...props}
							>{$formData.location
								? $formData.location
								: 'Seleccione una ubicación'}</Select.Trigger
						>
						<Select.Content>
							{#each locations as l}
								<Select.Item value={l}>{l}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Button
			action={ButtonAction.SUBMIT}
			textType={ButtonText.NO_COLOR}
			text="Cambiar a {orderStatusMap[OrderStatus.FINISHED]}"
			icon={getStatusUIInfo(OrderStatus.FINISHED).statusIcon}
			style={getStatusUIInfo(OrderStatus.FINISHED, true).colors}
		></Button>
		<Divider hideOnDesktop={false}></Divider>
	</form>
{/snippet}

{#snippet changeToOther(status: OrderStatus)}
	<form
		method="POST"
		use:sEnhance={() => {
			classicFormLoading = true;
			return async ({ update }) => {
				await update();
				classicFormLoading = false;
			};
		}}
		action="?/changeOrderStatus"
		class="flex flex-col gap-2"
	>
		<input type="hidden" name="status" value={status} />
		<Button
			action={ButtonAction.SUBMIT}
			textType={ButtonText.NO_COLOR}
			text="Cambiar a {orderStatusMap[status]}"
			icon={getStatusUIInfo(status).statusIcon}
			style={getStatusUIInfo(status, true).colors}
		></Button>
	</form>
{/snippet}

{#snippet sheetAction()}
	<div class="flex flex-col gap-2">
		{#each statuses as status}
			{#if status === OrderStatus.FINISHED}
				{@render changeToFinished()}
			{:else}
				{@render changeToOther(status)}
			{/if}
		{/each}
	</div>
{/snippet}

<BottomSheet
	title="Cambiar estado"
	description="Seleccione el nuevo estado del pedido"
	trigger={sheetTrigger}
	action={sheetAction}
	iconType={getStatusUIInfo(order.status).statusIcon}
	loading={formLoading || classicFormLoading}
	triggerStyle={getStatusUIInfoWithPaymentInfo(order.status, payed, true).colors}
	triggerTextType={ButtonText.NO_COLOR}
></BottomSheet>
