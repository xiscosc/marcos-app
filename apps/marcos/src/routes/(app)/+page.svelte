<script lang="ts">
	import { ButtonStyle, ButtonText, ButtonType } from '$lib/components/button/button.enum';
	import Button from '$lib/components/button/Button.svelte';
	import { IconSize, IconType } from '$lib/components/icon/icon.enum';
</script>

<div
	class="flex w-full flex-col place-content-center items-center justify-center gap-4 py-2 md:grid md:grid-cols-2 lg:grid-cols-3"
>
	<Button
		text="Buscar cliente"
		link="/customers/search"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.CUSTOMER}
		icon={IconType.SEARCH}
		iconSize={IconSize.BIG}
	></Button>

	<Button
		text="Listado pedidos"
		link="/orders/list"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.ORDER_GENERIC}
		textType={ButtonText.GRAY}
		icon={IconType.LIST}
		iconSize={IconSize.BIG}
	></Button>

	<Button
		text="Listado de presupuestos"
		link="/orders/list?status=quote"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.ORDER_QUOTE}
		icon={IconType.ORDER_QUOTE}
		iconSize={IconSize.BIG}
	></Button>

	<Button
		text="Escanear resguardo"
		link="/orders/scan"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.NEUTRAL}
		icon={IconType.QR}
		iconSize={IconSize.BIG}
	></Button>

	<Button
		text="Crear nota"
		link="/orders/new"
		buttonType={ButtonType.HOME}
		style={ButtonStyle.FORM}
		icon={IconType.FORM}
		iconSize={IconSize.BIG}
	></Button>
</div>
