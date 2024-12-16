<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import {
		PaymentStatus,
		type CalculatedItem,
		type Order
	} from '@marcsimolduressonsardina/core/type';
	import Divider from '$lib/components/Divider.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Input from '$lib/components/ui/input/input.svelte';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';

	interface Props {
		order: Order;
		calculatedItem: CalculatedItem;
	}

	let { order, calculatedItem }: Props = $props();

	let loading = $state(false);
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
</script>

{#snippet sheetTrigger()}
	{#if order.amountPayed === 0}
		<Button text="Pendiente de pago" icon={IconType.NOT_DONE} action={ButtonAction.TRIGGER}
		></Button>
	{:else if order.amountPayed === totalOrder}
		<Button text="Pagado" icon={IconType.DONE} action={ButtonAction.TRIGGER}></Button>
	{:else}
		<Button text="Parcialmente pagado" icon={IconType.NOT_DONE} action={ButtonAction.TRIGGER}
		></Button>
	{/if}
{/snippet}

{#snippet sheetAction()}
	<div class="flex flex-col gap-2">
		{#if order.amountPayed > 0 && order.amountPayed !== totalOrder}
			<div class="flex flex-col rounded-lg border border-gray-800 p-2">
				<div class="text-md flex items-center justify-center text-gray-800 line-through">
					<span>{totalOrder.toFixed(2)} €</span>
				</div>
				<div class="text-md flex items-center justify-center text-gray-800">
					<span>{order.amountPayed.toFixed(2)} € pagado</span>
				</div>
				<div class="flex items-center justify-center text-lg font-bold text-gray-800">
					<span>{(totalOrder - order.amountPayed).toFixed(2)} € pendiente</span>
				</div>
			</div>
		{:else}
			<div
				class="flex items-center justify-center rounded-lg border border-gray-800 p-2 text-lg font-bold text-gray-800"
			>
				<span
					>{totalOrder.toFixed(2)} € {order.amountPayed !== totalOrder
						? 'pendiente'
						: 'pagado'}</span
				>
			</div>
		{/if}

		<Divider></Divider>

		{#if order.amountPayed !== totalOrder}
			<form
				method="post"
				action="?/changePayment"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<input type="hidden" name="paymentStatus" value={PaymentStatus.FULLY_PAID} />
				<Button
					text="Pagado"
					icon={IconType.DONE}
					style={ButtonStyle.ORDER_PICKED_UP}
					action={ButtonAction.SUBMIT}
				></Button>
			</form>
		{/if}

		{#if order.amountPayed !== 0}
			<form
				method="post"
				action="?/changePayment"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<input type="hidden" name="paymentStatus" value={PaymentStatus.UNPAID} />
				<Button
					text="No pagado"
					icon={IconType.NOT_DONE}
					style={ButtonStyle.DELETE}
					action={ButtonAction.SUBMIT}
				></Button>
			</form>
		{/if}

		<Divider></Divider>

		<form
			method="post"
			class="flex flex-col gap-2"
			action="?/changePayment"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<input type="hidden" name="paymentStatus" value={PaymentStatus.PARTIALLY_PAID} />
			<Input type="number" name="amount" required placeholder="Cantidad EUR" step="0.01" />

			<Button
				text="Pago a cuenta"
				icon={IconType.COINS}
				style={ButtonStyle.ORDER_FINISHED}
				action={ButtonAction.SUBMIT}
			></Button>
		</form>
	</div>
{/snippet}

<BottomSheet
	title="Gestionar pago"
	description="Seleccione el nuevo estado del pago para el pedido"
	trigger={sheetTrigger as Snippet}
	action={sheetAction as Snippet}
	iconType={IconType.COINS}
	triggerTextType={ButtonText.NO_COLOR}
	triggerStyle={order.amountPayed === totalOrder
		? ButtonStyle.ORDER_PICKED_UP_VARIANT
		: ButtonStyle.DELETE_VARIANT}
	{loading}
></BottomSheet>
