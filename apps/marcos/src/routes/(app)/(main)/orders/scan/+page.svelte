<script lang="ts">
	import OrderScanner from '@/components/business-related/order/OrderScanner.svelte';
	import Box from '@/components/generic/Box.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { IconSize, IconType } from '@/components/generic/icon/icon.enum';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import type { PageProps } from './$types';
	import Icon from '@/components/generic/icon/Icon.svelte';
	import { ButtonAction } from '@/components/generic/button/button.enum';
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
