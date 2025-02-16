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
	import BottomSheetLoading from '$lib/components/BottomSheetLoading.svelte';

	interface Props {
		order: Order;
		calculatedItem: CalculatedItem;
	}

	let { order, calculatedItem }: Props = $props();

	let loading = $state(false);
	const totalOrder = CalculatedItemUtilities.getTotal(calculatedItem);
</script>

<BottomSheet
	title="Gestionar pago"
	description="Seleccione el nuevo estado del pago para el pedido"
	iconType={IconType.COINS}
	triggerTextType={ButtonText.NO_COLOR}
	triggerStyle={order.amountPayed === totalOrder
		? ButtonStyle.ORDER_PICKED_UP_VARIANT
		: ButtonStyle.DELETE_VARIANT}
>
	{#snippet trigger()}
		{#if totalOrder === 0 || order.amountPayed === totalOrder}
			<Button text="Pagado" icon={IconType.DONE} action={ButtonAction.TRIGGER}></Button>
		{:else if order.amountPayed === 0}
			<Button text="Pendiente de pago" icon={IconType.NOT_DONE} action={ButtonAction.TRIGGER}
			></Button>
		{:else}
			<Button text="Parcialmente pagado" icon={IconType.NOT_DONE} action={ButtonAction.TRIGGER}
			></Button>
		{/if}
	{/snippet}

	{#snippet action()}
		<div class="flex flex-col gap-2">
			{#if loading}
				<BottomSheetLoading />
			{:else}
				<div
					class="flex flex-col items-center justify-center rounded-lg border-2 border-dotted border-gray-800 p-2 text-gray-800"
				>
					{#if totalOrder === 0}
						<span class="text-lg font-bold"> Pago no necesario </span>
					{:else if order.amountPayed > 0 && order.amountPayed !== totalOrder}
						<span class="text-md line-through">{totalOrder.toFixed(2)} €</span>
						<span class="text-md">{order.amountPayed.toFixed(2)} € pagado</span>
						<span class="text-lg font-bold">
							{(totalOrder - order.amountPayed).toFixed(2)} € pendiente
						</span>
					{:else}
						<span class="text-lg font-bold">
							{totalOrder.toFixed(2)} € {order.amountPayed !== totalOrder ? 'pendiente' : 'pagado'}
						</span>
					{/if}
				</div>
				{#if totalOrder !== 0}
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
								textType={ButtonText.NO_COLOR}
								style={ButtonStyle.ORDER_PICKED_UP_VARIANT}
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
								textType={ButtonText.NO_COLOR}
								style={ButtonStyle.DELETE_VARIANT}
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
							textType={ButtonText.NO_COLOR}
							style={ButtonStyle.ORDER_FINISHED_VARIANT}
							action={ButtonAction.SUBMIT}
						></Button>
					</form>
				{/if}
			{/if}
		</div>
	{/snippet}
</BottomSheet>
