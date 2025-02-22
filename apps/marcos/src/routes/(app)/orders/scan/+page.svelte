<script lang="ts">
	import OrderScanner from '$lib/components/order/OrderScanner.svelte';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { IconSize, IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import type { PageProps } from './$types';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { ButtonAction } from '@/components/button/button.enum';
	let { form }: PageProps = $props();

	let scannedText = $state(undefined);
	let formScan = $state<HTMLFormElement | undefined>(undefined);
	let loading = $state(false);

	$effect(() => {
		if (scannedText != null && formScan != null) {
			loading = true;
			formScan.submit();
		}
	});
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.QR}>Escanear resguardo</SimpleHeading>
	<Box>
		<div class="flex flex-col items-center gap-3">
			{#if form?.incorrect}
				<Icon type={IconType.ALERT} size={IconSize.XXXL} />
				<p class="text-center text-xl font-semibold">El formato del resguardo es incorrecto</p>
			{:else if loading}
				<ProgressBar text={'Buscando pedido...'} />
			{:else}
				<OrderScanner bind:scannedText />
			{/if}
		</div>
	</Box>

	{#if form?.incorrect}
		<Button
			text="Volver a intentar"
			icon={IconType.ORDER_PENDING}
			action={ButtonAction.CLICK}
			onClick={() => window.location.reload()}
		></Button>
	{/if}
	<Button text="Introducir No. Pedido" icon={IconType.SEARCH} link="/orders/search"></Button>

	<form method="POST" bind:this={formScan}>
		<input type="hidden" bind:value={scannedText} name="scannedText" />
	</form>
</div>
