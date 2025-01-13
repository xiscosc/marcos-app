<script lang="ts">
	import { type FullOrder } from '@marcsimolduressonsardina/core/type';
	import OrderCard from './OrderCard.svelte';
	import OrderSkeletonCard from './OrderSkeletonCard.svelte';
	import Box from '../Box.svelte';
	import { IconType } from '../icon/icon.enum';
	import Button from '../button/Button.svelte';

	interface Props {
		promiseOrders?: Promise<FullOrder[]>;
		newPromiseOrders?: Promise<FullOrder[]>;
		paginationAvailable?: boolean;
		paginationFunction?: () => void;
		emptyMessage?: 'NOT_FOUND' | 'EMPTY';
		showCustomer?: boolean;
		loadingCount?: number;
	}

	let {
		promiseOrders,
		newPromiseOrders = undefined,
		paginationAvailable = false,
		paginationFunction = () => {},
		showCustomer = true,
		loadingCount = 15,
		emptyMessage = 'NOT_FOUND'
	}: Props = $props();

	let allOrders: FullOrder[] = $state([]);
	let loading = $state(false);
	let paginationLoading = $state(false);

	$effect(() => {
		if (promiseOrders == null) {
			loading = true;
			return;
		}
		loading = true;
		promiseOrders.then((orders) => {
			allOrders = orders;
			loading = false;
		});
	});

	$effect(() => {
		if (newPromiseOrders == null) {
			return;
		}
		paginationLoading = true;
		newPromiseOrders.then((orders) => {
			allOrders = [...allOrders, ...orders];
			paginationLoading = false;
		});
	});
</script>

{#snippet loadingSkeleton()}
	<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each Array(loadingCount) as _}
			<OrderSkeletonCard></OrderSkeletonCard>
		{/each}
	</div>
{/snippet}

{#if promiseOrders == null}
	{@render loadingSkeleton()}
{:else if loading}
	{@render loadingSkeleton()}
{:else if allOrders.length === 0 && emptyMessage === 'NOT_FOUND'}
	<Box title="Sin Resultados" icon={IconType.ALERT}>
		<p class="text-md">No se han encontrado pedidos</p>
	</Box>
{:else}
	<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each allOrders as fullOrder}
			<OrderCard {fullOrder} {showCustomer} />
		{/each}
		{#if paginationLoading}
			{#each Array(Math.min(5, loadingCount)) as _}
				<OrderSkeletonCard></OrderSkeletonCard>
			{/each}
		{:else if paginationAvailable}
			<div class="flex h-full md:col-span-2 lg:col-span-3 xl:col-span-5">
				<Button text="Cargar más" icon={IconType.ORDER_DEFAULT} onClick={paginationFunction}
				></Button>
			</div>
		{/if}
	</div>
{/if}
