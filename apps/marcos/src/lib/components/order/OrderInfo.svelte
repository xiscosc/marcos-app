<script lang="ts">
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import { DateTime } from 'luxon';
	import Box from '$lib/components/Box.svelte';
	import { DimensionsType, OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';
	import { IconType } from '../icon/icon.enum';
	import OrderInfoStep from './OrderInfoStep.svelte';

	interface Props {
		order: Order;
	}

	let { order }: Props = $props();
</script>

<Box title={`Detalles ${order.hasArrow ? ' ⬇︎' : ''}`} collapsible>
	<div class="flex flex-col gap-2">
		<OrderInfoStep iconType={IconType.WORKER} title="Dependiente" value={order.user.name} />

		{#if order.status !== OrderStatus.QUOTE}
			<OrderInfoStep
				iconType={IconType.CLOCK}
				title="Fecha de recogida"
				value={order.item.instantDelivery
					? 'Al momento'
					: DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
			/>
		{/if}

		<OrderInfoStep
			iconType={IconType.RULER}
			title="Medidas de la obra"
			value={`${order.item.height}x${order.item.width} cm`}
		/>

		<OrderInfoStep
			iconType={IconType.RULER}
			title="Medidas de trabajo"
			value={OrderUtilities.getWorkingDimensions(order)}
		/>

		{#if order.item.dimensionsType === DimensionsType.EXTERIOR}
			<OrderInfoStep
				iconType={IconType.RULER}
				title="Medidas exteriores del marco"
				value={`${order.item.exteriorHeight}x${order.item.exteriorWidth} cm`}
			/>
		{/if}

		{#if order.item.dimensionsType === DimensionsType.ROUNDED || order.item.dimensionsType === DimensionsType.WINDOW}
			<OrderInfoStep
				iconType={IconType.SETTINGS}
				title="Tipo de medidas"
				value={order.item.dimensionsType === DimensionsType.ROUNDED ? 'Redondas' : 'A ventana'}
			/>
		{/if}

		<OrderInfoStep iconType={IconType.EYE} title="Descripción" value={order.item.description} />
		<OrderInfoStep
			iconType={IconType.LIST}
			title="Observaciones"
			value={order.item.observations}
			valueList={order.item.predefinedObservations}
		/>
	</div>
</Box>
