<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Html5Qrcode, Html5QrcodeScannerState, type Html5QrcodeResult } from 'html5-qrcode';
	import { onMount, onDestroy } from 'svelte';
	import Box from '../Box.svelte';

	let html5QrCode: Html5Qrcode;
	const config = { fps: 10, qrbox: { width: 250, height: 250 } };

	let loading = false;

	onMount(() => {
		html5QrCode = new Html5Qrcode('reader');
		html5QrCode.start({ facingMode: 'environment' }, config, onScanSuccess, undefined);
	});

	onDestroy(() => {
		if (html5QrCode && html5QrCode.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
			html5QrCode
				.stop()
				.then((ignore) => {})
				.catch((err) => {});
		}
	});

	function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
		html5QrCode
			.stop()
			.then((ignore) => {
				window.navigator.vibrate([500]);
				loading = true;
				goto('/orders/' + decodedText);
			})
			.catch((err) => {});
	}
</script>

<main>
	{#if loading}
		<Box>
			<ProgressBar text={'Cargando pedido'} />
		</Box>
	{/if}
	<div id="reader" class="reader"></div>
</main>

<style>
	.reader {
		width: 350px;
	}
</style>
