<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import type { DateRange } from 'bits-ui';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone
	} from '@internationalized/date';
	import { cn } from '@/utils.js';
	import { buttonVariants } from '@/components/ui/button/index.js';
	import { RangeCalendar } from '@/components/ui/range-calendar/index.js';
	import * as Popover from '@/components/ui/popover/index.js';
	import type { ReportDate } from '@marcsimolduressonsardina/core/type';

	const df = new DateFormatter('es-ES', {
		dateStyle: 'medium'
	});

	interface Props {
		startDate: ReportDate | undefined;
		endDate: ReportDate | undefined;
		open: boolean;
	}

	let { startDate = $bindable(), endDate = $bindable(), open = $bindable(false) }: Props = $props();

	let value: DateRange = $state({
		start: startDate ? new CalendarDate(startDate.year, startDate.month, startDate.day) : undefined,
		end: endDate ? new CalendarDate(endDate.year, endDate.month, endDate.day) : undefined
	});

	function calendarDateToReportDate(date?: DateValue): ReportDate | undefined {
		if (date == null) {
			return undefined;
		}

		return {
			day: date.day,
			month: date.month,
			year: date.year
		};
	}
</script>

<div class="grid gap-2">
	<Popover.Root bind:open>
		<Popover.Trigger
			class={cn(
				buttonVariants({ variant: 'outline' }),
				!value && 'text-muted-foreground',
				'border-gray-300'
			)}
		>
			<CalendarIcon class="mr-2 size-4" />
			{#if value && value.start}
				{#if value.end}
					{df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
						value.end.toDate(getLocalTimeZone())
					)}
				{:else}
					{df.format(value.start.toDate(getLocalTimeZone()))}
				{/if}
			{/if}
		</Popover.Trigger>
		<Popover.Content class="w-auto p-0" align="start">
			<RangeCalendar
				locale={'es'}
				bind:value
				onStartValueChange={(v) => {
					startDate = calendarDateToReportDate(v);
				}}
				onEndValueChange={(v) => {
					endDate = calendarDateToReportDate(v);
				}}
				numberOfMonths={2}
			/>
		</Popover.Content>
	</Popover.Root>
</div>
