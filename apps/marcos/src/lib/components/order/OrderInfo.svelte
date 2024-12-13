<script lang="ts">
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import { DateTime } from 'luxon';
	import Box from '$lib/components/Box.svelte';
	import { DimensionsType, OrderStatus, type Order } from '@marcsimolduressonsardina/core/type';

	interface Props {
		order: Order;
	}

	let { order }: Props = $props();
</script>

<Box title={`Detalles ${order.hasArrow ? ' ⬇︎' : ''}`}>
	<div class="text-md grid gap-2 text-gray-700">
		<div class="flex justify-between">
			<span class="font-semibold">Dependiente:</span>
			<span>{order.user.name}</span>
		</div>

		{#if order.status !== OrderStatus.QUOTE}
			<div class="flex justify-between">
				<span class="font-semibold">Fecha de recogida:</span>
				<span>
					{#if order.item.instantDelivery}
						Al momento
					{:else}
						{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
					{/if}
				</span>
			</div>
		{/if}

		<div class="flex justify-between">
			<span class="font-semibold">Medidas de la obra:</span>
			<span>{`${order.item.height}x${order.item.width} cm`}</span>
		</div>

		<div class="flex justify-between">
			<span class="font-semibold">Medidas de trabajo:</span>
			<span>{OrderUtilities.getWorkingDimensions(order)}</span>
		</div>

		{#if order.item.dimensionsType === DimensionsType.EXTERIOR}
			<div class="flex justify-between">
				<span class="font-semibold">Medidas exteriores del marco:</span>
				<span>{`${order.item.exteriorHeight}x${order.item.exteriorWidth} cm`}</span>
			</div>
		{/if}

		{#if order.item.dimensionsType === DimensionsType.ROUNDED || order.item.dimensionsType === DimensionsType.WINDOW}
			<div class="flex justify-between">
				<span class="font-semibold">Tipo de medidas:</span>
				<span>
					{#if order.item.dimensionsType === DimensionsType.ROUNDED}
						Redondas
					{:else}
						A ventana
					{/if}
				</span>
			</div>
		{/if}

		<div>
			<span class="font-semibold">Descripción:</span>
			<p class="mt-1 pl-2">{order.item.description}</p>
		</div>

		<div>
			<span class="font-semibold">Observaciones:</span>
			<p class="mt-1 pl-2">{order.item.observations}</p>
			{#each order.item.predefinedObservations as obv}
				<p class="mt-1 pl-2">- {obv}</p>
			{/each}
		</div>
	</div>
</Box>
