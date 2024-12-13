<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	import type { PageData } from './$types';
	import WhatsAppButton from '$lib/components/button/WhatsAppButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import { IconSize, IconType } from '$lib/components/icon/icon.enum';
	import Icon from '$lib/components/icon/Icon.svelte';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import { enhance, applyAction } from '$app/forms';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let loading = $state(false);
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.LIST}>Detalles del cliente</SimpleHeading>
	<Box>
		{#await data.customer}
			<ProgressBar />
		{:then customer}
			{#if customer == null}
				<p class="text-center text-3xl">Cliente no encontrado</p>
				<div class="mt-4 flex justify-center">
					<a
						href="/customers/search"
						class="w-full rounded-md bg-blue-800 px-4 py-2 text-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
					>
						Buscar cliente
					</a>
				</div>
			{:else}
				<div
					class="flex items-center space-x-4 rounded-md border border-gray-300 bg-neutral-50 p-5"
				>
					<Icon type={IconType.USER} size={IconSize.BIG} />
					<div>
						<p class="text-lg font-semibold text-gray-700">{customer.name}</p>
						<p class="text-sm text-gray-500">{customer.phone}</p>
					</div>
					<a
						class="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
						aria-label="Editar cliente"
						href="/customers/{customer.id}/edit"
					>
						<Icon type={IconType.EDIT} />
					</a>
				</div>

				<div class="mt-4 flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
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

					<WhatsAppButton label="Enviar Whatsapp" message="" {customer}></WhatsAppButton>

					{#if data.isPriceManager}
						{#snippet sheetTrigger()}
							<Button
								disabled={data.totalOrders > 0}
								tooltipText={'El cliente tiene pedidos o presupuestos'}
								icon={IconType.TRASH}
								text="Eliminar cliente"
								action={ButtonAction.TRIGGER}
							></Button>
						{/snippet}

						{#snippet sheetAction()}
							{#if data.totalOrders > 0}
								El cliente tiene pedidos o presupuestos, no se puede eliminar.
							{:else}
								<form
									class="w-full text-center"
									method="post"
									action="?/deleteCustomer"
									use:enhance={() => {
										loading = true;
										return async ({ update }) => {
											await update();
											loading = false;
										};
									}}
								>
									<Button
										icon={IconType.TRASH}
										text="Confirmar"
										style={ButtonStyle.DELETE}
										action={ButtonAction.SUBMIT}
									></Button>
								</form>
							{/if}
						{/snippet}

						<BottomSheet
							{loading}
							title="Eliminar cliente"
							description="Esta acción no se puede deshacer"
							trigger={sheetTrigger}
							action={sheetAction}
							iconType={IconType.TRASH}
							triggerStyle={ButtonStyle.DELETE}
						></BottomSheet>
					{/if}
				</div>
			{/if}
		{/await}
	</Box>
</div>
