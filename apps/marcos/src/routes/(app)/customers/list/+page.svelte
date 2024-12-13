<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import type { Customer } from '@marcsimolduressonsardina/core/type';
	import { onMount } from 'svelte';
	import { ButtonStyle, ButtonText } from '$lib/components/button/button.enum';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	let customers: Customer[] = $state([]);
	let loading = $state(false);
	let lastKey: Record<string, string | number> | undefined = $state(undefined);

	async function loadCustomers() {
		loading = true;
		const response = await fetch('/api/customers/list', {
			method: 'POST',
			body: JSON.stringify({ lastKey }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const customerPaginationResponse = (await response.json()) as {
			customers: Customer[];
			lastKey?: Record<string, string | number>;
		};

		customers = [...customers, ...customerPaginationResponse.customers];
		lastKey = customerPaginationResponse.lastKey;
		loading = false;
	}

	onMount(async () => {
		await loadCustomers();
	});
</script>

<div class="space flex w-full flex-col gap-4">
	<SimpleHeading icon={IconType.LIST}>Listado de clientes</SimpleHeading>
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

		{#if lastKey}
			<Button
				text="Cargar más"
				icon={IconType.PLUS}
				style={ButtonStyle.NEUTRAL}
				onClick={loadCustomers}
			></Button>
		{/if}
	</div>

	{#if loading}
		<ProgressBar text="Cargando clientes"></ProgressBar>
	{/if}
</div>
