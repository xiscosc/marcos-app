<script lang="ts">
	import type { Customer } from '@marcsimolduressonsardina/core/type';
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import {
		ButtonAction,
		ButtonStyle,
		ButtonText,
		ButtonType
	} from '@/components/generic/button/button.enum';
	import WhatsAppButton from '@/components/business-related/button/WhatsAppButton.svelte';
	import { enhance } from '$app/forms';
	import BottomSheet from '@/components/generic/BottomSheet.svelte';
	import BottomSheetLoading from '@/components/generic/BottomSheetLoading.svelte';
	import { trackEvent } from '@/shared/analytics.utilities';

	interface Props {
		customer: Customer;
		showDelete?: boolean;
		totalOrders?: number;
		allowCol?: boolean;
	}

	let formLoading = $state(false);
	let { customer, showDelete = false, totalOrders = 0, allowCol = false }: Props = $props();
</script>

<div class="flex w-full flex-col gap-3">
	<div
		class="flex w-full flex-row items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
	>
		<div class="flex flex-row items-center justify-start gap-2">
			<div class="rounded-full border border-gray-100 bg-white p-2 text-gray-900">
				<Icon type={IconType.USER} size={IconSize.BIG} />
			</div>

			<div>
				<p class="text-md font-medium">{customer.name}</p>
				<p class="text-sm">{customer.phone}</p>
			</div>
		</div>

		<div class="flex" class:md:hidden={allowCol}>
			<Button
				text=""
				link="/customers/{customer.id}/edit"
				icon={IconType.EDIT}
				style={ButtonStyle.SOFT_DELETE}
				buttonType={ButtonType.SMALL}
				textType={ButtonText.GRAY}
			/>
		</div>

		<div class="hidden" class:md:flex={allowCol}>
			<Button
				text="Editar"
				link="/customers/{customer.id}/edit"
				icon={IconType.EDIT}
				style={ButtonStyle.SOFT_DELETE}
				buttonType={ButtonType.SMALL}
				textType={ButtonText.GRAY}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-2" class:lg:flex-row={allowCol}>
		<Button
			icon={IconType.FORM}
			link="/customers/{customer.id}/orders/new"
			text="Crear nota"
			style={ButtonStyle.FORM}
		></Button>

		<Button
			textType={ButtonText.GRAY}
			icon={IconType.ORDER_DEFAULT}
			link="/customers/{customer.id}/orders"
			text="Ver pedidos"
			style={ButtonStyle.ORDER_GENERIC}
		></Button>

		<Button
			icon={IconType.ORDER_QUOTE}
			link="/customers/{customer.id}/orders?quotes=true"
			text="Ver presupuestos"
			style={ButtonStyle.ORDER_QUOTE}
		></Button>

		<div class="flex md:hidden">
			<Button
				icon={IconType.PHONE}
				link={`tel:${customer.phone}`}
				text="Llamar"
				action={ButtonAction.LINK}
				trackFunction={() => {
					trackEvent('Customer called', { customerId: customer.id });
				}}
			></Button>
		</div>

		<WhatsAppButton label="Enviar Whatsapp" message="" {customer}></WhatsAppButton>

		{#if showDelete}
			<BottomSheet
				title="Eliminar cliente"
				description="Esta acción no se puede deshacer"
				iconType={IconType.TRASH}
				triggerStyle={ButtonStyle.DELETE}
			>
				{#snippet trigger()}
					<Button
						disabled={totalOrders > 0}
						tooltipText={'El cliente tiene pedidos o presupuestos'}
						icon={IconType.TRASH}
						text="Eliminar cliente"
						action={ButtonAction.TRIGGER}
					></Button>
				{/snippet}

				{#snippet action()}
					{#if totalOrders > 0}
						El cliente tiene pedidos o presupuestos, no se puede eliminar.
					{:else}
						<form
							class="w-full text-center"
							method="post"
							action="?/deleteCustomer"
							use:enhance={() => {
								formLoading = true;
								return async ({ update }) => {
									await update();
									formLoading = false;
								};
							}}
						>
							{#if formLoading}
								<BottomSheetLoading />
							{:else}
								<Button
									icon={IconType.TRASH}
									text="Confirmar"
									style={ButtonStyle.DELETE}
									action={ButtonAction.SUBMIT}
								></Button>
							{/if}
						</form>
					{/if}
				{/snippet}
			</BottomSheet>
		{/if}
	</div>
</div>
