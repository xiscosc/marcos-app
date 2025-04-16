<script lang="ts">
	import { DateTime } from 'luxon';
	import {
		type LocationOrderSchema,
		type StatusOrderSchema
	} from '@/shared/form-schema/order.form-schema';
	import Button from '@/components/generic/button/Button.svelte';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '@/ui/ui.helper';
	import { OrderUtilities as CoreOrderUtilities } from '@marcsimolduressonsardina/core/util';
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import LocationOrderBottomSheet from '@/components/business-related/order-detail/edit/LocationOrderBottomSheet.svelte';
	import StatusOrderBottomSheet from '@/components/business-related/order-detail/edit/StatusOrderBottomSheet.svelte';
	import PaymentOrderBottomSheet from '@/components/business-related/order-detail/edit/PaymentOrderBottomSheet.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import CustomerDetails from '@/components/business-related/customer/CustomerDetails.svelte';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	interface Props {
		fullOrder: FullOrder;
		locationForm: SuperValidated<Infer<LocationOrderSchema>>;
		statusForm: SuperValidated<Infer<StatusOrderSchema>>;
		locations: string[];
	}

	let { fullOrder, locationForm, locations, statusForm }: Props = $props();
	const order = fullOrder.order;
	const calculatedItem = fullOrder.calculatedItem;
	const totals = fullOrder.totals;
</script>

{#snippet dateCreated()}
	<div class="flex flex-row items-center gap-1 text-xs text-gray-700">
		<Icon type={IconType.CLOCK} />
		<span>{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy HH:mm')}</span>
	</div>
{/snippet}

{#snippet customerTrigger()}
	<Button text={order.customer.name} icon={IconType.USER} action={ButtonAction.TRIGGER}></Button>
{/snippet}

{#snippet customerAction()}
	<CustomerDetails customer={order.customer}></CustomerDetails>
{/snippet}

<div class="overflow-hidden rounded-md border border-gray-50">
	<div
		class={`flex items-center justify-between px-3 py-2 text-white ${
			getStatusUIInfoWithPaymentInfo(order.status, totals.payed).staticColor
		}`}
	>
		<span class="flex items-center px-2 text-lg font-semibold">
			<span class="flex items-center gap-2">
				<Icon type={getStatusUIInfo(order.status).statusIcon} />
				{order.status === OrderStatus.QUOTE ? 'Presupuesto' : 'Pedido'}
			</span>
		</span>
		<div class="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem]">
			<span class="rounded-lg bg-white px-2 py-1 font-mono text-gray-800">
				{order.publicId}
			</span>
		</div>
	</div>

	<div class="space-y-1 bg-white px-2 py-4">
		{#if !CoreOrderUtilities.isOrderTemp(order)}
			<BottomSheet
				trigger={customerTrigger}
				action={customerAction}
				triggerStyle={ButtonStyle.CUSTOMER_VARIANT}
				triggerTextType={ButtonText.NO_COLOR}
			></BottomSheet>
		{/if}

		{#if order.status !== OrderStatus.QUOTE}
			<PaymentOrderBottomSheet {fullOrder}></PaymentOrderBottomSheet>

			<StatusOrderBottomSheet {fullOrder} {locations} data={statusForm}></StatusOrderBottomSheet>

			{#if order.status === OrderStatus.FINISHED}
				<LocationOrderBottomSheet {order} {locations} data={locationForm}
				></LocationOrderBottomSheet>
			{/if}
		{/if}

		<div class="px-2 pt-1">
			{#if order.amountPayed > 0 && !totals.payed}
				<div class="flex flex-row items-end justify-between">
					<div class="flex flex-col">
						<span class="text-lg text-gray-800 line-through">{totals.total.toFixed(2)} €</span>
						<span class="text-lg text-gray-800">{order.amountPayed.toFixed(2)} € pagado</span>
						<span class="text-xl font-bold text-gray-800">
							{totals.remainingAmount.toFixed(2)} € pendiente
						</span>
					</div>
					<div class="pb-1">
						{@render dateCreated()}
					</div>
				</div>
			{:else}
				<div class="flex flex-row items-center justify-between">
					<span class="text-xl font-bold text-gray-800">{totals.total.toFixed(2)} €</span>
					{@render dateCreated()}
				</div>
			{/if}
		</div>
	</div>
</div>
