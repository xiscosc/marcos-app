<script lang="ts">
	import QRCode from 'qrcode';
	import type { QRCodeRenderersOptions } from 'qrcode';
	import { onMount } from 'svelte';

	let { size, qrData }: { size: number; qrData: string } = $props();

	const qrOptions: QRCodeRenderersOptions = {
		margin: 0,
		width: size
	};

	let qrString: string | undefined = $state();

	onMount(async () => {
		qrString = await QRCode.toDataURL(qrData, qrOptions);
	});
</script>

{#if qrString}
	<img src={qrString} alt="qr" />
{/if}
