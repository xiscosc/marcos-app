<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import OrderInfo from '$lib/components/order/OrderInfo.svelte';
	import OrderElements from '$lib/components/order/OrderElements.svelte';
	import OrderHeader from '$lib/components/order/OrderHeader.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import WhatsAppOrderButtons from '$lib/components/order/WhatsAppOrderButtons.svelte';
	import { ButtonAction, ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Box from '$lib/components/Box.svelte';
	import DeleteOrderBottomSheet from '$lib/components/order/form/DeleteOrderBottomSheet.svelte';
	import PromoteOrderBottomSheet from '$lib/components/order/form/PromoteOrderBottomSheet.svelte';
	import DenoteOrderBottomSheet from '$lib/components/order/form/DenoteOrderBottomSheet.svelte';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import OrderSkeletonHeader from '$lib/components/order/OrderSkeletonHeader.svelte';
	import { OrderUtilities } from '@marcsimolduressonsardina/core/util';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';

	let formLoading = $state(false);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	$effect(() => {
		if (data.info) {
			data.info.then((info) => {
				if (info.order != null && OrderUtilities.isOrderTemp(info.order)) {
					goto(`/orders/${info.order.id}/link`);
				}
			});
		}
	});
</script>

{#snippet loadingSection(sectionName: string)}
	<Box title={sectionName}>
		<div class="flex flex-col gap-2">
			<div class="flex flex-row justify-between">
				<Skeleton class="h-4 w-64" />
				<Skeleton class="h-4 w-16" />
			</div>
			<div class="flex flex-row justify-between">
				<Skeleton class="h-4 w-64" />
				<Skeleton class="h-4 w-16" />
			</div>
			<div class="flex flex-row justify-between">
				<Skeleton class="h-4 w-64" />
				<Skeleton class="h-4 w-16" />
			</div>
			<div class="flex flex-row justify-between">
				<Skeleton class="h-4 w-64" />
				<Skeleton class="h-4 w-16" />
			</div>
		</div>
	</Box>
{/snippet}

<div class="flex flex-col gap-3">
	<SimpleHeading icon={IconType.ORDER_DEFAULT}>Detalles del pedido</SimpleHeading>
	{#await data.info}
		<OrderSkeletonHeader></OrderSkeletonHeader>
		{@render loadingSection('Detalles')}
		{@render loadingSection('Elementos')}
	{:then info}
		<div class="space flex w-full flex-col gap-3">
			{#if info.order == null || info.calculatedItem == null}
				<Box icon={IconType.ALERT} title="Cliente o pedido no encontrado">
					<p class="text-md">El cliente o pedido solicitado no existe, puede haber sido borrado.</p>
				</Box>
			{:else}
				<OrderHeader
					order={info.order}
					calculatedItem={info.calculatedItem}
					locations={info.locations}
					locationForm={data.locationForm}
					statusLocationForm={data.statusLocationForm}
				></OrderHeader>

				{#if !formLoading}
					<div class="flex w-full flex-col gap-1 md:grid md:grid-cols-2 lg:grid-cols-3">
						{#if info.order.status === OrderStatus.QUOTE}
							<PromoteOrderBottomSheet data={data.promoteForm}></PromoteOrderBottomSheet>
						{:else}
							<Button
								textType={ButtonText.GRAY}
								icon={IconType.ORDER_DEFAULT}
								style={ButtonStyle.ORDER_GENERIC}
								text="Pedidos del día"
								link={`/orders/${info.order.id}/day`}
							></Button>

							<DenoteOrderBottomSheet></DenoteOrderBottomSheet>
						{/if}

						<WhatsAppOrderButtons
							order={info.order}
							counters={info.unfinishedSameDayCount}
							hasFiles={info.hasFiles}
						></WhatsAppOrderButtons>
						<Divider hideOnDesktop={true}></Divider>
						<Button
							disabled={!info.hasFiles}
							tooltipText={'Faltan fotos'}
							icon={IconType.PRINTER}
							text="Imprimir"
							action={ButtonAction.LINK}
							link={`/orders/${info.order.id}/print`}
						></Button>
						<Button icon={IconType.EDIT} text="Editar" link={`/orders/${info.order.id}/edit`}
						></Button>
						<Button
							icon={IconType.COPY}
							text="Copiar"
							link={`/orders/new?originId=${info.order.id}`}
						></Button>

						<Divider hideOnDesktop={true}></Divider>
						<Button icon={IconType.CAMERA} text="Cámara" link={`/orders/${info.order.id}/files`}
						></Button>
					</div>
				{/if}

				{#if formLoading}
					<span class=""> <ProgressBar text={'Aplicando cambios...'} /> </span>
				{/if}

				<OrderInfo order={info.order}></OrderInfo>

				<OrderElements order={info.order} calculatedItem={info.calculatedItem}></OrderElements>

				{#if data.isPriceManager}
					<DeleteOrderBottomSheet order={info.order}></DeleteOrderBottomSheet>
				{/if}
			{/if}
		</div>
	{/await}
</div>
