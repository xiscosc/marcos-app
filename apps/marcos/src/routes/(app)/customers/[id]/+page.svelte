<script lang="ts">
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import Box from '@/components/generic/Box.svelte';
	import type { PageData } from './$types';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import CustomerDetails from '@/components/business-related/customer/CustomerDetails.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.LIST}>Detalles del cliente</SimpleHeading>
	<Box>
		{#await data.customer}
			<ProgressBar />
		{:then customer}
			{#if customer == null}
				<p class="text-center text-3xl">Cliente no encontrado</p>
				<div class="mt-4 flex justify-center">
					<a
						href="/customers/search"
						class="focus:outline-hidden w-full rounded-md bg-blue-800 px-4 py-2 text-white hover:bg-blue-900 focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
					>
						Buscar cliente
					</a>
				</div>
			{:else}
				<CustomerDetails
					{customer}
					showDelete={data.isPriceManager}
					totalOrders={data.totalOrders}
					allowCol
				/>
			{/if}
		{/await}
	</Box>
</div>
