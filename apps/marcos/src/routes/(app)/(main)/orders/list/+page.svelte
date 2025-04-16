<script lang="ts">
	import type { PageData } from './$types';
	import { orderStatusMap } from '@/shared/mappings/order.mapping';
	import Box from '@/components/generic/Box.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import { ButtonAction, ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import Input from '@/components/ui/input/input.svelte';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { OrderUtilities } from '@/shared/order.utilities';
	import { getStatusUIInfo } from '@/ui/ui.helper';
	import OrderList from '@/components/business-related/order-list/OrderList.svelte';
	import { getGlobalProfiler } from '@/state/profiler/profiler.state';

	interface Props {
		data: PageData;
	}

	const allowedStatus = [OrderStatus.QUOTE, OrderStatus.PENDING, OrderStatus.FINISHED];
	const initialStatus = page.url.searchParams.get('status') as OrderStatus;
	let { data }: Props = $props();
	let searchValue = $state('');
	let status: OrderStatus = $state(
		allowedStatus.indexOf(initialStatus) === -1 ? OrderStatus.PENDING : initialStatus
	);
	let timer: NodeJS.Timeout;
	let searchOrders: Promise<FullOrder[]> | undefined = $state(undefined);
	let listOrders: Promise<FullOrder[]> | undefined = $state(undefined);
	let paginatedListOrders: Promise<FullOrder[]> | undefined = $state(undefined);
	let lastKey: Record<string, string | number> | undefined = $state();
	let paginationAvailable = $derived(searchValue.length === 0 && lastKey != null);

	function getStatus(statusStr: string) {
		const status = statusStr as OrderStatus;
		const name = orderStatusMap[status];
		if (status === OrderStatus.QUOTE) {
			return `Listado de ${name}s`;
		} else {
			return `Pedidos ${name}s`;
		}
	}
	async function getList(): Promise<FullOrder[]> {
		if (data.priceManager) {
			const listResponse = fetch('/api/orders/list', {
				method: 'POST',
				body: JSON.stringify({ lastKey, status }),
				headers: {
					'content-type': 'application/json'
				}
			});

			const response = await getGlobalProfiler().measure(listResponse);
			const body: { orders: FullOrder[]; nextKey?: Record<string, string | number> } =
				await response.json();
			lastKey = body.nextKey;
			return OrderUtilities.hydrateFullOrderDates(body.orders);
		} else {
			lastKey = undefined;
			return [];
		}
	}

	async function search(query: string): Promise<FullOrder[]> {
		if (query.length < 3) {
			return [];
		}

		const listResponse = fetch('/api/orders/search', {
			method: 'POST',
			body: JSON.stringify({ query, status }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const response = await getGlobalProfiler().measure(listResponse);
		const body: { results: FullOrder[] } = await response.json();
		return OrderUtilities.hydrateFullOrderDates(body.results);
	}

	const debounce = (v: string) => {
		clearTimeout(timer);
		searchOrders = undefined;
		timer = setTimeout(() => {
			searchOrders = search(v);
		}, 400);
	};

	onMount(async () => {
		listOrders = getList();
	});

	async function changeStatus(newStatus: OrderStatus) {
		goto('?status=' + newStatus.toString());
	}
</script>

<div class="space flex w-full flex-col gap-4">
	<SimpleHeading icon={IconType.ORDER_DEFAULT}>{getStatus(status)}</SimpleHeading>
	<Box>
		<div class="flex flex-col gap-3">
			{#if status !== OrderStatus.QUOTE}
				<div
					class="flex w-full flex-col place-content-center items-center justify-center gap-3 md:grid md:grid-cols-2"
				>
					<Button
						text={status === OrderStatus.FINISHED
							? 'Viendo pedidos finalizados'
							: 'Ver pedidos finalizados'}
						action={ButtonAction.CLICK}
						onClick={() => {
							if (status !== OrderStatus.FINISHED) {
								changeStatus(OrderStatus.FINISHED);
							}
						}}
						style={status === OrderStatus.FINISHED
							? ButtonStyle.ORDER_FINISHED_VARIANT
							: ButtonStyle.ORDER_FINISHED}
						textType={status === OrderStatus.FINISHED ? ButtonText.NO_COLOR : ButtonText.WHITE}
						icon={getStatusUIInfo(OrderStatus.FINISHED).statusIcon}
					></Button>

					<Button
						text={status === OrderStatus.PENDING
							? 'Viendo pedidos pendientes'
							: 'Ver pedidos pendientes'}
						action={ButtonAction.CLICK}
						onClick={() => {
							if (status !== OrderStatus.PENDING) {
								changeStatus(OrderStatus.PENDING);
							}
						}}
						style={status === OrderStatus.PENDING
							? ButtonStyle.ORDER_PENDING_VARIANT
							: ButtonStyle.ORDER_PENDING}
						textType={status === OrderStatus.PENDING ? ButtonText.NO_COLOR : ButtonText.WHITE}
						icon={getStatusUIInfo(OrderStatus.PENDING).statusIcon}
					></Button>
				</div>
			{/if}

			<div>
				<Input
					bind:value={searchValue}
					type="text"
					placeholder="Buscar en descripción..."
					onkeyup={() => debounce(searchValue)}
				></Input>
			</div>
		</div>
	</Box>

	{#if searchValue.length === 0}
		<OrderList
			promiseOrders={listOrders}
			newPromiseOrders={paginatedListOrders}
			emptyMessage="EMPTY"
			{paginationAvailable}
			paginationFunction={() => {
				paginatedListOrders = getList();
			}}
		/>
	{/if}

	{#if searchValue.length > 0}
		{#if searchValue.length < 3}
			<div class="w-full text-center">Escribe más de 3 carácteres</div>
		{:else}
			<OrderList promiseOrders={searchOrders} loadingCount={3} />
		{/if}
	{/if}
</div>
