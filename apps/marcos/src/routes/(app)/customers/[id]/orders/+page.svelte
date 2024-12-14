<script lang="ts">
	import type { PageData } from './$types';

	import { IconType } from '$lib/components/icon/icon.enum';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ButtonStyle } from '$lib/components/button/button.enum';
	import OrderList from '$lib/components/order/OrderList.svelte';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import { OrderStatus } from '@marcsimolduressonsardina/core/type';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const orderTypeName = data.showQuotes ? 'Presupuestos' : 'Pedidos';
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.USER}>
		{orderTypeName} de {data.customer?.name}
	</SimpleHeading>
	{#await data.orders}
		<OrderList
			orders={[]}
			showCustomer={false}
			loading={true}
			loadingSize={5}
			status={data.showQuotes ? OrderStatus.QUOTE : OrderStatus.PENDING}
		/>
	{:then orders}
		{#if orders == null}
			<Box title="Cliente no encontrado" icon={IconType.USER}>
				<Button
					text="Buscar cliente"
					link="/customers/search"
					icon={IconType.SEARCH}
					style={ButtonStyle.CUSTOMER}
				/>
			</Box>
		{:else if orders.length === 0}
			<Box title="Sin Resultados" icon={IconType.ORDER_DEFAULT}>
				<p class="text-md">El cliente no tiene {orderTypeName.toLocaleLowerCase()}</p>
			</Box>
		{:else}
			<OrderList {orders} showCustomer={false} loading={false} status={OrderStatus.PENDING} />
		{/if}
	{:catch error}
		<Box>
			<span class="text-md">Error obteniendo los {orderTypeName.toLocaleLowerCase()}</span>
		</Box>
	{/await}
</div>
