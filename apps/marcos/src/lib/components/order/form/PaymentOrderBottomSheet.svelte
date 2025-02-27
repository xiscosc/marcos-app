<script lang="ts">
	import { enhance } from '$app/forms';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import { PaymentStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import Divider from '$lib/components/Divider.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Input from '$lib/components/ui/input/input.svelte';
	import BottomSheetLoading from '$lib/components/BottomSheetLoading.svelte';

	interface Props {
		fullOrder: FullOrder;
	}

	let { fullOrder }: Props = $props();
	const order = fullOrder.order;
	const totals = fullOrder.totals;

	let loading = $state(false);
</script>

<BottomSheet
	title="Gestionar pago"
	description="Seleccione el nuevo estado del pago para el pedido"
	iconType={IconType.COINS}
	triggerTextType={ButtonText.NO_COLOR}
	triggerStyle={totals.payed ? ButtonStyle.ORDER_PICKED_UP_VARIANT : ButtonStyle.DELETE_VARIANT}
>
	{#snippet trigger()}
		{#if totals.payed}
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
					{#if totals.total === 0}
						<span class="text-lg font-bold"> Pago no necesario </span>
					{:else if order.amountPayed > 0 && !totals.payed}
						<span class="text-md line-through">{totals.total.toFixed(2)} €</span>
						<span class="text-md">{order.amountPayed.toFixed(2)} € pagado</span>
						<span class="text-lg font-bold">
							{totals.remainingAmount.toFixed(2)} € pendiente
						</span>
					{:else}
						<span class="text-lg font-bold">
							{totals.total.toFixed(2)} € {order.amountPayed !== totals.total
								? 'pendiente'
								: 'pagado'}
						</span>
					{/if}
				</div>
				{#if totals.total !== 0}
					<Divider></Divider>

					{#if !totals.payed}
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
