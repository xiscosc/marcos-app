<script lang="ts">
	import Box from '@/components/generic/Box.svelte';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonStyle, ButtonText } from '@/components/generic/button/button.enum';
	import { IconType } from '@/components/generic/icon/icon.enum';
</script>

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.SETTINGS}>Configuración de la aplicación</SimpleHeading>
	<Box title="Precios">
		<div
			class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-2 md:grid md:grid-cols-2 lg:grid-cols-3"
		>
			<Button
				link="/config/prices/molds"
				text="Cargar molduras"
				icon={IconType.MOLD}
				style={ButtonStyle.NEUTRAL}
			></Button>

			<Button
				link="/config/prices/new"
				text="Nuevo precio"
				icon={IconType.COINS}
				style={ButtonStyle.FORM}
			></Button>

			<Button
				link="/config/prices/list"
				text="Lista de precios"
				icon={IconType.LIST}
				style={ButtonStyle.ORDER_GENERIC}
				textType={ButtonText.GRAY}
			></Button>
		</div>
	</Box>

	<Box title="Pedidos">
		<div
			class="flex w-full flex-col place-content-center items-center justify-center gap-4 p-2 md:grid md:grid-cols-2 lg:grid-cols-3"
		>
			<Button
				link="/config/orders/locations"
				text="Editar ubicaciones"
				style={ButtonStyle.NEUTRAL}
				icon={IconType.LOCATION}
			></Button>
		</div>
	</Box>
</div>
