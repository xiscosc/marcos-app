<script lang="ts">
	import { onMount } from 'svelte';
	import { OrderUtilities } from '$lib/shared/order.utilities';
	import { DateTime } from 'luxon';
	import Qr from '$lib/components/Qr.svelte';
	import { otherForPrintPricingTypes } from '$lib/shared/pricing.utilites';
	import {
		DimensionsType,
		OrderStatus,
		PricingType,
		type CalculatedItem,
		type Order
	} from '@marcsimolduressonsardina/core/type';
	import { CalculatedItemUtilities } from '@marcsimolduressonsardina/core/util';

	let {
		order,
		calculatedItem,
		print = false
	}: { order: Order; calculatedItem: CalculatedItem; print?: boolean } = $props();

	const totalOrder = calculatedItem ? CalculatedItemUtilities.getTotal(calculatedItem) : 0;
	const isQuote = order.status === OrderStatus.QUOTE;

	const others = [
		...otherForPrintPricingTypes
			.map((t) => OrderUtilities.getOrderElementByPricingType(order, calculatedItem, t))
			.flat(),
		...OrderUtilities.getExtras(calculatedItem)
	];

	export const weekDayMap: Record<string, string> = {
		['Mon']: 'Lun',
		['Tue']: 'Mar',
		['Wed']: 'Mie',
		['Thu']: 'Jue',
		['Fri']: 'Vie',
		['Sat']: 'Sab',
		['Sun']: 'Dom'
	};

	const enWeekDay = DateTime.fromJSDate(order.item.deliveryDate).weekdayShort as string;
	const esWeekDay = weekDayMap[enWeekDay] ?? enWeekDay;
	const discount =
		calculatedItem.discount > 0
			? `(${OrderUtilities.getDiscountRepresentation(calculatedItem.discount)})`
			: '';

	const statusInfo: string[] = [];

	if (!isQuote) {
		if (order.status === OrderStatus.PICKED_UP) {
			statusInfo.push('ENTREGADO');
		}
		if (order.amountPayed === totalOrder) {
			statusInfo.push('PAGADO');
		} else if (order.amountPayed === 0) {
			statusInfo.push('PENDIENTE DE PAGO');
		} else {
			statusInfo.push(`PENDIENTE DE PAGO (${(totalOrder - order.amountPayed).toFixed(2)} €)`);
		}
	} else {
		statusInfo.push('PRESUPUESTO');
	}

	function groupInPairs(arr: string[]): string[][] {
		const result: string[][] = [];

		for (let i = 0; i < arr.length; i += 2) {
			const pair: string[] = [arr[i], arr[i + 1] || ''];
			result.push(pair);
		}

		return result;
	}

	const bullCharacter = '\u2022';

	onMount(() => {
		if (print) {
			setTimeout(() => {
				window.print();
			}, 750);
		}
	});
</script>

<main>
	<table>
		<tbody>
			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								<td>
									<Qr size={85} qrData={order.id}></Qr>
									<div class="customer-text">
										<p class="customer-bottom">{OrderUtilities.getOrderPublicId(order)}</p>
									</div>
								</td>
								<td>
									<img
										class="logo"
										src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
										alt="logo"
									/>
									<div class="customer-text">
										<p class="customer-bottom">
											Polígono de Son Rossinyol - Gremi Hortolans 19 - 971666920
										</p>
										<p class="customer-bottom">www.marcsimoldures.com - mmss@marcsimoldures.com</p>
										<p class="customer-bottom">Horario de lunes a viernes de 09:00 a 18:00,</p>
										<p class="customer-bottom">sábados de 09:30 a 13:15</p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>

			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								<th>Dependiente</th>
								<th>Fecha</th>
								<th>Hora</th>
							</tr>
							<tr>
								<td>{order.user.name.split(' ')[0]}</td>
								<td>
									{DateTime.fromJSDate(order.createdAt).toFormat('dd/MM/yyyy')}
								</td>
								<td>{DateTime.fromJSDate(order.createdAt).toFormat('HH:mm')}</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>

			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								<th>Moldura</th>
								<th>Cristal</th>
								<th>Trasera</th>
								<th>PP / Fondo</th>
							</tr>
							<tr>
								<td>
									{#each OrderUtilities.getOrderMolds(order) as mold}
										{mold}<br />
									{/each}
									{#if order.item.floatingDistance > 0}
										{`Dist flot: ${order.item.floatingDistance}cm`}
									{/if}
								</td>
								<td>
									{#each OrderUtilities.getOrderElementByPricingType(order, calculatedItem, PricingType.GLASS) as glass}
										{glass}<br />
									{/each}
								</td>
								<td>
									{#each OrderUtilities.getOrderElementByPricingType(order, calculatedItem, PricingType.BACK) as back}
										{back}<br />
									{/each}
								</td>
								<td>
									{#if OrderUtilities.getOrderElementByPricingType(order, calculatedItem, PricingType.PP).length > 0}
										{OrderUtilities.getOrderElementByPricingType(
											order,
											calculatedItem,
											PricingType.PP
										)[0]}
										{order.item.pp}cm <br />
										{#each OrderUtilities.getOrderElementByPricingType(order, calculatedItem, PricingType.PP).slice(1) as pp}
											{pp}<br />
										{/each}
									{/if}

									{#if order.item.ppDimensions}
										AR: {order.item.ppDimensions.up}, AB: {order.item.ppDimensions.down}, D: {order
											.item.ppDimensions.right}, I: {order.item.ppDimensions.left}
									{/if}
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>

			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								<th>Medidas trabajo</th>
								<th>Uds</th>
								<th>Descripción</th>
								<th>Medidas obra</th>
							</tr>
							<tr>
								<td>
									{OrderUtilities.getWorkingDimensions(order)}
									{#if order.item.dimensionsType === DimensionsType.EXTERIOR}
										<br />
										<strong>
											Medidas ext: {`${order.item.exteriorHeight}x${order.item.exteriorWidth} cm`}
										</strong>
									{/if}
									{#if order.item.dimensionsType === DimensionsType.WINDOW}
										<br />
										<strong> A ventana </strong>
									{/if}
									{#if order.item.dimensionsType === DimensionsType.ROUNDED}
										<br />
										<strong> Redondas </strong>
									{/if}
								</td>
								<td> {order.item.quantity} </td>
								<td>{order.item.description}</td>
								<td>{`${order.item.height}x${order.item.width} cm`}</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>

			{#if others.length > 0}
				<tr>
					<td class="inner-td">
						<table class="inner-table">
							<tbody>
								<tr>
									<th colspan="2" class="list-th"> Otros </th>
								</tr>
								{#each groupInPairs(others) as pair}
									<tr>
										<td class="list-td"> {bullCharacter} {pair[0]} </td>
										<td class="list-td">
											{#if pair[1].length > 0}
												{bullCharacter} {pair[1]}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</td>
				</tr>
			{/if}

			{#if order.item.observations.trim().length > 0 || order.item.predefinedObservations.length > 0}
				<tr>
					<td class="inner-td">
						<table class="inner-table">
							<tbody>
								<tr>
									<th colspan="2" class="list-th"> Observaciones </th>
								</tr>
								{#if order.item.observations.trim().length > 0}
									<tr>
										<td colspan="2" class="list-td">
											{order.item.observations}
										</td>
									</tr>
								{/if}
								{#each groupInPairs(order.item.predefinedObservations) as pair}
									<tr>
										<td class="list-td"> {bullCharacter} {pair[0]} </td>
										<td class="list-td">
											{#if pair[1].length > 0}
												{bullCharacter} {pair[1]}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</td>
				</tr>
			{/if}

			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								<th>{discount} Precio ud</th>
								{#if calculatedItem.discount > 0}
									<th>Precio dto</th>
								{/if}
								<th>Uds</th>
								<th>A cuenta</th>
								<th>Total {order.hasArrow ? '⬇︎' : ''}</th>
							</tr>
							<tr>
								<td>
									{CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)} €
								</td>
								{#if calculatedItem.discount > 0}
									<td>{CalculatedItemUtilities.getUnitPriceWithDiscount(calculatedItem)} €</td>
								{/if}
								<td> {order.item.quantity} </td>
								<td> {order.amountPayed.toFixed(2)} €</td>
								<td>{totalOrder.toFixed(2)} €</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>

			<tr>
				<td class="inner-td">
					<table class="inner-table">
						<tbody>
							<tr>
								{#if !isQuote}
									<th> Recogida </th>
								{/if}
								<th> Cliente </th>
								<th> Teléfono </th>
							</tr>
							<tr>
								{#if !isQuote}
									<td>
										{#if order.item.instantDelivery}
											Al momento
										{:else}
											{esWeekDay}
											{DateTime.fromJSDate(order.item.deliveryDate).toFormat('dd/MM/yyyy')}
										{/if}
									</td>
								{/if}
								<td> {order.customer.name} </td>
								<td> {order.customer.phone} </td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
			{#if statusInfo.length > 0}
				<tr>
					<td class="inner-td">
						<table class="inner-table">
							<tbody>
								<tr>
									<td class="status-info">
										{statusInfo.join(' | ')}
									</td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
	<div class="customer-text">
		{#if !isQuote}
			<p class="customer-bottom">
				Una vez pasados <strong>15 días desde la fecha estipulada de entrega</strong>, la empresa
				<strong>no se hará cargo del material.</strong>
			</p>
			<p class="customer-bottom">
				<strong>Sin el justificante no se hará entrega del material.</strong>
			</p>
		{:else}
			<p class="customer-bottom">
				Este presupuesto tiene una validez de <strong>30 días desde la fecha de emisión</strong>,
				para la aceptación del presupuesto y puesta en marcha del pedido deberá hacer el pago del
				50% del presupuesto.
			</p>
			<p class="customer-bottom">
				<strong>IBAN ES13 2100 6805 9102 0013 3197 / SWIFT CAIXESBBXXX</strong>
			</p>
		{/if}
	</div>
</main>

<style>
	@media print {
		table {
			width: 100%;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		@page {
			size: A5 portrait;
			margin: 0 !important;
		}

		body {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}

	.inner-table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid black;
		border-bottom: none;
	}

	.inner-td {
		padding: 0;
	}

	.inner-table th {
		background-color: #ececec;
		padding: 2px 3px 2px 3px;
		color: #393939;
		font-size: xx-small;
		border: 1px solid black;
		border-bottom: none;
	}

	.inner-table td {
		padding: 3px;
		text-align: center;
		border: 1px solid black;
		border-bottom: none;
		font-size: x-small;
	}

	.customer-text {
		font-family: sans-serif;
		font-size: x-small;
	}

	.inner-table .list-td {
		border: none;
		text-align: left;
	}

	.inner-table .list-th {
		border: 1px solid black;
	}

	.inner-table .status-info {
		padding: 4px;
		border-bottom: 1px solid black;
	}

	.customer-bottom {
		margin: 0;
		text-align: center;
	}

	table {
		font-family: monospace;
		border-collapse: collapse;
		margin: 0 auto;
	}

	.logo {
		height: 55px;
	}

	.status-info {
		font-weight: bold;
	}
</style>
