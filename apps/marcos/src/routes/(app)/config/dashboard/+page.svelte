<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { DashboardReport, ReportDate } from '@marcsimolduressonsardina/core/type';
	import { DateTime } from 'luxon';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { orderStatusMap, OrderUtilities } from '$lib/shared/order.utilities';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { getStatusUIInfo } from '$lib/ui/ui.helper';
	import Chart from '$lib/components/dashboard/Chart.svelte';
	import DateRangePicker from '$lib/components/dashboard/DateRangePicker.svelte';

	const today = DateTime.now().startOf('day');
	const daysAgo = DateTime.now().startOf('month');

	let dashboardReport: DashboardReport | undefined = $state();
	let loading = $state(true);
	let calendarOpen = $state(false);
	let startDate: ReportDate = $state({
		day: daysAgo.day,
		month: daysAgo.month,
		year: daysAgo.year
	});
	let endDate: ReportDate = $state({ day: today.day, month: today.month, year: today.year });

	let isSameDay = $derived(twoDatesAreTheSame(startDate, endDate));

	function twoDatesAreTheSame(date1: ReportDate, date2: ReportDate): boolean {
		return date1.day === date2.day && date1.month === date2.month && date1.year === date2.year;
	}

	async function getDashboard(start: ReportDate, end: ReportDate): Promise<void> {
		loading = true;
		const response = await fetch('/api/orders/data', {
			method: 'POST',
			body: JSON.stringify({ endDate: end, startDate: start }),
			headers: {
				'content-type': 'application/json'
			}
		});

		const body: DashboardReport = await response.json();
		for (const topOrder of body.topOrders) {
			topOrder.order.createdAt = new Date(topOrder.order.createdAt);
		}

		loading = false;
		dashboardReport = body;
	}

	$effect(() => {
		if (startDate && endDate && !calendarOpen) {
			getDashboard(startDate, endDate);
		}
	});
</script>

{#snippet counter(title: string, value: number | string, icon?: IconType)}
	<Box {title} {icon}>
		<div class="flex w-full flex-row justify-center md:justify-end">
			<span class="text-2xl font-medium md:text-5xl">{value}</span>
		</div>
	</Box>
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
		<SimpleHeading icon={IconType.DASHBOARD}>Dashboard</SimpleHeading>
		<DateRangePicker bind:startDate bind:endDate bind:open={calendarOpen} />
	</div>

	{#if loading}
		<Box>
			<ProgressBar text="Cargando información" />
		</Box>
	{:else if dashboardReport}
		<div class="flex flex-col gap-2 md:flex-row">
			{@render counter('Total pedidos', dashboardReport.totalOrders, IconType.ORDER_DEFAULT)}
			{@render counter('Total caja', dashboardReport.totalCash.toFixed(2) + ' €', IconType.COINS)}
			{@render counter('Total clientes', dashboardReport.totalCustomers, IconType.USER)}
			{@render counter('Total ítems', dashboardReport.totalItems, IconType.LIST)}
		</div>

		{#if !isSameDay}
			<Box title="Pedidos diarios" icon={IconType.CHART_LINES}>
				<Chart
					type="line"
					unit="Pedidos"
					data={dashboardReport.dailyOrders.map((d) => ({
						name: `${d.date.day}/${d.date.month}/${d.date.year}`,
						total: d.total
					}))}
				/>
			</Box>

			<Box title="Caja diaria" icon={IconType.CHART_BARS}>
				<Chart
					type="bar"
					unit="€"
					data={dashboardReport.dailyCash.map((d) => ({
						name: `${d.date.day}/${d.date.month}/${d.date.year}`,
						total: d.total
					}))}
				/>
			</Box>
		{/if}

		<Box title="Top pedidos" icon={IconType.ORDER_DEFAULT}>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Estado</Table.Head>
						<Table.Head>Cliente</Table.Head>
						<Table.Head>Fecha</Table.Head>
						<Table.Head>Total</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dashboardReport.topOrders as topOrder}
						<Table.Row>
							<Table.Cell>
								<a
									class="rounded-lg bg-gray-100 px-2 py-1 font-mono text-gray-800"
									href={`/orders/${topOrder.order.id}`}
								>
									{topOrder.order.publicId}
								</a>
							</Table.Cell>
							<Table.Cell>
								<div
									class={`flex flex-row justify-center gap-1 rounded-md py-1 text-white ${getStatusUIInfo(topOrder.order.status).staticColor}`}
								>
									<Icon type={getStatusUIInfo(topOrder.order.status).statusIcon} />
									{orderStatusMap[topOrder.order.status]}
								</div>
							</Table.Cell>
							<Table.Cell>
								<a href={`/customers/${topOrder.order.customer.id}`} class="flex flex-row gap-1">
									<Icon type={IconType.USER} />
									{topOrder.order.customer.name}
								</a>
							</Table.Cell>
							<Table.Cell>
								{DateTime.fromJSDate(topOrder.order.createdAt).toFormat('dd/MM/yyyy')} a las {topOrder.order.createdAt.getHours()}:{topOrder.order.createdAt.getMinutes()}
							</Table.Cell>
							<Table.Cell>{topOrder.total.toFixed(2)} €</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Box>

		<Box title="Top clientes" icon={IconType.USER_PLUS}>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nombre</Table.Head>
						<Table.Head>Total</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dashboardReport.topCustomers as topCustomer}
						<Table.Row>
							<Table.Cell>
								<a href={`/customers/${topCustomer.customer.id}`} class="flex flex-row gap-1">
									<Icon type={IconType.USER} />
									{topCustomer.customer.name}
								</a>
							</Table.Cell>
							<Table.Cell>{topCustomer.total.toFixed(2)} €</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Box>

		<Box title="Top ítems" icon={IconType.LIST}>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Cantidad</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each dashboardReport.topItems as topItem}
						<Table.Row>
							<Table.Cell>
								<span class="rounded-lg bg-gray-100 px-2 py-1 font-mono text-gray-800">
									{topItem.id}
								</span>
							</Table.Cell>
							<Table.Cell>{topItem.count}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Box>
	{/if}
</div>
