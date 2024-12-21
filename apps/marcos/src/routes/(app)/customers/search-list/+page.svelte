<script lang="ts">
	import type { PageData } from './$types';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Box from '$lib/components/Box.svelte';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.SEARCH}>
		Búsqueda de clientes - {data.decodedSearchQuery}
	</SimpleHeading>
	{#await data.customers}
		<Box><ProgressBar text={'Buscando clientes'} /></Box>
	{:then customers}
		<div class="flex w-full flex-col gap-1 lg:grid lg:grid-cols-4">
			{#each customers as customer}
				<Button
					textType={ButtonText.GRAY}
					link={`/customers/${customer.id}`}
					text={customer.name}
					icon={IconType.USER}
					style={ButtonStyle.ORDER_GENERIC}
				></Button>
			{/each}
		</div>
		{#if customers.length === 0}
			<Box title="Sin Resultados" icon={IconType.USER}>
				<p class="text-md">No se han encontrado clientes</p>
			</Box>
		{/if}
	{/await}
</div>
