<script lang="ts">
	import type { PageData } from './$types';
	import { ScrollArea } from '@/components/ui/scroll-area/index.js';
	import NewCustomer from '@/components/business-related/customer/NewCustomer.svelte';
	import OrderInfo from '@/components/business-related/order-detail/OrderInfo.svelte';
	import OrderElements from '@/components/business-related/order-detail/OrderElements.svelte';
	import Box from '@/components/generic/Box.svelte';
	import { goto } from '$app/navigation';
	import Banner from '@/components/generic/Banner.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { Input } from '@/components/ui/input';
	import type { Customer } from '@marcsimolduressonsardina/core/type';
	import Separator from '@/components/ui/separator/separator.svelte';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import OrderPriceDetails from '@/components/business-related/order-detail/OrderPriceDetails.svelte';
	import { getGlobalProfiler } from '@/stores/profiler.store';

	interface Props {
		data: PageData;
	}

	let timer: NodeJS.Timeout;
	let { data }: Props = $props();
	let firstTimeSearch = $state(true);
	let loading = $state(false);
	let searchQuery = $state('');
	let customers = $state<Customer[]>([]);

	async function searchCustomers() {
		if (searchQuery.length === 0) {
			customers = [];
			loading = false;
			return;
		}

		const listResponse = fetch('/api/customers/search', {
			method: 'POST',
			body: JSON.stringify({ query: searchQuery }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const response = await getGlobalProfiler().measure(listResponse);
		const body: { customers: Customer[] } = await response.json();
		customers = [...body.customers];
		loading = false;
		firstTimeSearch = false;
	}

	const debounce = () => {
		clearTimeout(timer);
		loading = true;
		customers = [];
		timer = setTimeout(() => {
			searchCustomers();
		}, 400);
	};
</script>

<div class="flex flex-col gap-2">
	<Banner
		icon={IconType.USER}
		color="teal"
		title="Vincular cliente al {data.orderName}"
		text="Rellene sólo el teléfono, si el cliente no existe, tendrá que poner su nombre. También puede buscar por nombre."
	></Banner>

	<div class="flex flex-col gap-2">
		<NewCustomer
			{data}
			link
			icon={IconType.PHONE}
			title={'Vincular por teléfono o crear nuevo cliente'}
			buttonText={'Vincular'}
		/>

		<Box title={'Buscar cliente por nombre'} icon={IconType.SEARCH}>
			<div class="flex flex-col gap-3">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="phone">Nombre:</label>
					<Input
						bind:value={searchQuery}
						id="name"
						required
						type="text"
						name="name"
						placeholder="Nombre a buscar..."
						onkeyup={() => debounce()}
					/>
				</div>

				{#if loading}
					<ProgressBar text="Buscando clientes" />
				{:else if !firstTimeSearch}
					<ScrollArea class="h-72 rounded-md border lg:col-span-2">
						<div class="p-4">
							<h4 class="mb-4 text-sm font-medium leading-none">Clientes encontrados</h4>
							{#each customers as customer}
								<button
									onclick={() => goto(`/orders/${data.fullOrder.order.id}/link/${customer.id}`)}
									class="flexr-row flex w-full items-center gap-2 rounded-md p-2 hover:bg-gray-50"
									type="button"
								>
									<Icon type={IconType.USER_PLUS} />
									<div class="text-sm">{customer.name}</div>
								</button>
								<Separator class="my-2 last:hidden" />
							{/each}
							{#if customers.length === 0}
								<div class="flex flex-row items-center gap-2 p-2">
									<Icon type={IconType.NOT_FOUND} />
									<span>No se encontraron resultados</span>
								</div>
							{/if}
						</div>
					</ScrollArea>
				{/if}
			</div>
		</Box>

		<OrderInfo order={data.fullOrder.order}></OrderInfo>

		<OrderElements fullOrder={data.fullOrder}></OrderElements>

		{#if data.fullOrder.calculatedItem.quantity > 1 || data.fullOrder.calculatedItem.discount > 0}
			<OrderPriceDetails
				quantity={data.fullOrder.calculatedItem.quantity}
				discount={data.fullOrder.calculatedItem.discount}
				unitPriceWithoutDiscount={data.fullOrder.totals.unitPriceWithoutDiscount}
				unitPriceWithDiscount={data.fullOrder.totals.unitPrice}
				totalWithoutDiscount={data.fullOrder.totals.totalWithoutDiscount}
				totalWithDiscount={data.fullOrder.totals.total}
				alertItemsWitouthDiscount={data.fullOrder.totals.discountNotAllowedPresent}
				collapsed={false}
			></OrderPriceDetails>
		{/if}
	</div>
</div>
