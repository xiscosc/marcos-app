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
	import { CalculatedItemUtilities, OrderUtilities } from '@marcsimolduressonsardina/core/util';
	import {
		OrderStatus,
		type Order,
		type OrderAuditTrailEntry
	} from '@marcsimolduressonsardina/core/type';
	import Step from '@/components/Step.svelte';
	import { DateTime } from 'luxon';
	import OrderPriceDetails from '@/components/order/OrderPriceDetails.svelte';
	import { isSmBreakpoint } from '@/stores/breakpoint.svelte';

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
	<div class="lg:mt-3 lg:break-inside-avoid">
		<Box title={sectionName}>
			<div class="flex flex-col gap-2">
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			</div>
		</Box>
	</div>
{/snippet}

{#snippet deleteOrderSection(mobile: boolean, isPriceManager: boolean, order?: Order)}
	{#if isPriceManager && order && ((mobile && $isSmBreakpoint) || (!mobile && !$isSmBreakpoint))}
		<div class="lg:mt-3 lg:break-inside-avoid">
			<Box title="Administración">
				<DeleteOrderBottomSheet {order}></DeleteOrderBottomSheet>
			</Box>
		</div>
	{/if}
{/snippet}

{#snippet notificationSection(entries: OrderAuditTrailEntry[], mobile: boolean)}
	{#if entries.length > 0 && ((mobile && $isSmBreakpoint) || (!mobile && !$isSmBreakpoint))}
		<div class="lg:mt-3 lg:break-inside-avoid">
			<Box title="Avisos al cliente">
				<div class="flex flex-col gap-2">
					{#each entries as entry}
						<Step
							icon={IconType.WHATSAPP}
							title={entry.userName}
							subtitle="Mensaje finalizado - {DateTime.fromJSDate(entry.createdAt).toFormat(
								'dd/MM/yyyy HH:mm'
							)}"
						></Step>
					{/each}
				</div>
			</Box>
		</div>
	{/if}
{/snippet}

<div class="flex flex-col gap-3">
	<SimpleHeading icon={IconType.ORDER_DEFAULT}>Detalles del pedido</SimpleHeading>
	{#await data.info}
		<div class="flex w-full flex-col gap-3 lg:block lg:columns-2">
			<OrderSkeletonHeader></OrderSkeletonHeader>
			{@render loadingSection('Detalles')}
			{@render loadingSection('Elementos')}
		</div>
	{:then info}
		<div class="flex w-full flex-col gap-3 lg:block lg:columns-2">
			{#if info.order == null || info.calculatedItem == null}
				<div class="lg:mt-3 lg:break-inside-avoid">
					<Box icon={IconType.ALERT} title="Cliente o pedido no encontrado">
						<p class="text-md">
							El cliente o pedido solicitado no existe, puede haber sido borrado.
						</p>
					</Box>
				</div>
			{:else}
				<OrderHeader
					order={info.order}
					calculatedItem={info.calculatedItem}
					locations={info.locations}
					locationForm={data.locationForm}
					statusForm={data.statusForm}
				></OrderHeader>

				{#if !formLoading}
					<div
						class="flex w-full flex-col gap-1 md:grid md:grid-cols-2 lg:mt-3 lg:break-inside-avoid lg:grid-cols-3"
					>
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

				<div class="lg:mt-3 lg:break-inside-avoid">
					<OrderInfo order={info.order}></OrderInfo>
				</div>

				{#if info.notificationEntries.length > 0}
					{@render notificationSection(info.notificationEntries, false)}
				{:else}
					{@render deleteOrderSection(false, data.isPriceManager, info.order)}
				{/if}

				<div class="lg:mt-3 lg:break-inside-avoid">
					<OrderElements
						order={info.order}
						calculatedItem={info.calculatedItem}
						discountNotAllowedPresent={info.totals.discountNotAllowedPresent}
					></OrderElements>
				</div>

				{#if info.calculatedItem.quantity > 1 || info.calculatedItem.discount > 0}
					<div class="lg:mt-3 lg:break-inside-avoid">
						<OrderPriceDetails
							quantity={info.calculatedItem.quantity}
							discount={info.calculatedItem.discount}
							unitPriceWithoutDiscount={CalculatedItemUtilities.getUnitPriceWithoutDiscount(
								info.calculatedItem
							)}
							unitPriceWithDiscount={CalculatedItemUtilities.getUnitPriceWithDiscount(
								info.calculatedItem
							)}
							totalWithoutDiscount={CalculatedItemUtilities.getTotalWithoutDiscount(
								info.calculatedItem
							)}
							totalWithDiscount={CalculatedItemUtilities.getTotal(info.calculatedItem)}
							alertItemsWitouthDiscount={discountNotAllowedPresent}
							collapsed={false}
						></OrderPriceDetails>
					</div>
				{/if}

				{@render notificationSection(info.notificationEntries, true)}
				{@render deleteOrderSection(true, data.isPriceManager, info.order)}
				{#if info.notificationEntries.length > 0}
					{@render deleteOrderSection(false, data.isPriceManager, info.order)}
				{/if}
			{/if}
		</div>
	{/await}
</div>
