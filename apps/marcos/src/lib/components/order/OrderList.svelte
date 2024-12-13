<script lang="ts">
	import type { FullOrder } from '@marcsimolduressonsardina/core/type';
	import OrderCard from './OrderCard.svelte';

	interface Props {
		orders: FullOrder[];
		showCustomer?: boolean;
	}

	let { orders, showCustomer = true }: Props = $props();
</script>

<div class="flex w-full flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
	{#each orders as fullOrder}
		<OrderCard {fullOrder} {showCustomer} />
	{/each}
</div>
