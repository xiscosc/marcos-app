<script lang="ts">
	import type { PageData } from './$types';
	import { orderStatusMap } from '$lib/shared/order.utilities';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import { ButtonStyle } from '$lib/components/button/button.enum';
	import OrderList from '$lib/components/order/OrderList.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let searchValue = $state('');
	let timer: NodeJS.Timeout;
	let searchOrders: Promise<FullOrder[]> | undefined = $state(undefined);
	let loading = $state(false);

	function getStatus(statusStr: string) {
		const status = statusStr as OrderStatus;
		const name = orderStatusMap[status];
		if (status === OrderStatus.QUOTE) {
			return `Listado de ${name}s`;
		} else {
			return `Pedidos ${name}s`;
		}
	}

	async function search(query: string): Promise<FullOrder[]> {
		if (query.length < 3) {
			return [];
		}

		const response = await fetch('/api/orders/search', {
			method: 'POST',
			body: JSON.stringify({ query, status: data.status }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const body: { results: FullOrder[] } = await response.json();
		return body.results.map((fo) => ({
			calculatedItem: fo.calculatedItem,
			order: {
				...fo.order,
				item: {
					...fo.order.item,
					deliveryDate: new Date(fo.order.item.deliveryDate)
				},
				createdAt: new Date(fo.order.createdAt)
			}
		}));
	}

	const debounce = (v: string) => {
		clearTimeout(timer);
		loading = true;
		searchOrders = undefined;
		timer = setTimeout(() => {
			searchOrders = search(v);
			loading = false;
		}, 400);
	};
</script>

<div class="space flex w-full flex-col gap-4">
	<SimpleHeading icon={IconType.ORDER_DEFAULT}>{getStatus(data.status)}</SimpleHeading>
	<Box>
		<div class="flex flex-col gap-3">
			{#if data.status !== OrderStatus.QUOTE}
				<div
					class="flex w-full flex-col place-content-center items-center justify-center gap-3 md:grid md:grid-cols-2"
				>
					<Button
						text="Ver pedidos finalizados"
						link={`/orders/list?status=${OrderStatus.FINISHED}`}
						style={ButtonStyle.ORDER_FINISHED}
						icon={getStatusUIInfo(OrderStatus.FINISHED).statusIcon}
					></Button>

					<Button
						text="Ver pedidos pendientes"
						link={`/orders/list?status=${OrderStatus.PENDING}`}
						style={ButtonStyle.ORDER_PENDING}
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
		<OrderList promiseOrders={data.orders} emptyMessage="EMPTY" />
	{/if}

	{#if searchValue.length > 0}
		{#if searchValue.length < 3}
			<div class="w-full text-center">Escribe más de 3 carácteres</div>
		{:else}
			<OrderList promiseOrders={searchOrders} loadingCount={3} />
		{/if}
	{/if}
</div>
