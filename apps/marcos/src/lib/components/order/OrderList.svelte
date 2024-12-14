<script lang="ts">
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import OrderCard from './OrderCard.svelte';
	import OrderSkeletonCard from './OrderSkeletonCard.svelte';

	interface Props {
		orders: FullOrder[];
		showCustomer?: boolean;
		status: OrderStatus;
		loading: boolean;
		loadingSize?: number;
	}

	let { orders, status, showCustomer = true, loading = false, loadingSize = 15 }: Props = $props();
</script>

{#if loading}
	<div class="flex w-full flex-col gap-3 md:hidden">
		{#each Array(3) as _}
			<OrderSkeletonCard {status}></OrderSkeletonCard>
		{/each}
	</div>

	<div class="hidden w-full gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each Array(loadingSize) as _}
			<OrderSkeletonCard {status}></OrderSkeletonCard>
		{/each}
	</div>
{:else}
	<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
		{#each orders as fullOrder}
			<OrderCard {fullOrder} {showCustomer} />
		{/each}
	</div>
{/if}
