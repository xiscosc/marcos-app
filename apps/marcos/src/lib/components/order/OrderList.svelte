<script lang="ts">
	import { type FullOrder } from '@marcsimolduressonsardina/core/type';
	import OrderCard from './OrderCard.svelte';
	import OrderSkeletonCard from './OrderSkeletonCard.svelte';
	import Box from '../Box.svelte';
	import { IconType } from '../icon/icon.enum';

	interface Props {
		promiseOrders: Promise<FullOrder[]> | undefined;
		emptyMessage?: 'NOT_FOUND' | 'EMPTY';
		showCustomer?: boolean;
		loadingCount?: number;
	}

	let {
		promiseOrders,
		showCustomer = true,
		loadingCount = 15,
		emptyMessage = 'NOT_FOUND'
	}: Props = $props();
</script>

{#snippet loading()}
	<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each Array(loadingCount) as _}
			<OrderSkeletonCard></OrderSkeletonCard>
		{/each}
	</div>
{/snippet}

{#if promiseOrders == null}
	{@render loading()}
{:else}
	{#await promiseOrders}
		{@render loading()}
	{:then orders}
		{#if orders.length === 0 && emptyMessage === 'NOT_FOUND'}
			<Box title="Sin Resultados" icon={IconType.ALERT}>
				<p class="text-md">No se han encontrado pedidos</p>
			</Box>
		{:else}
			<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{#each orders as fullOrder}
					<OrderCard {fullOrder} {showCustomer} />
				{/each}
			</div>
		{/if}
	{/await}
{/if}
