<script lang="ts">
	import OrderScanner from '$lib/components/order/OrderScanner.svelte';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.QR}>Escanear resguardo</SimpleHeading>
	<Box>
		<div class="flex flex-col items-center gap-3">
			<OrderScanner />
			<Button text="Introducir No. Pedido" icon={IconType.SEARCH} link="/orders/search"></Button>
		</div>
	</Box>
</div>
