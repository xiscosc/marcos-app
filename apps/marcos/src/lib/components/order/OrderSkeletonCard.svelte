<script lang="ts">
	import { DateTime } from 'luxon';
	import { OrderUtilities, orderStatusMap } from '$lib/shared/order.utilities';
	import { getStatusUIInfo, getStatusUIInfoWithPaymentInfo } from '$lib/ui/ui.helper';
	import {
		CalculatedItemUtilities,
		OrderUtilities as CoreOrderUtilities
	} from '@marcsimolduressonsardina/core/util';
	import Button from '../button/Button.svelte';
	import { ButtonStyle } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
	import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';
	import Skeleton from '../ui/skeleton/skeleton.svelte';

	interface Props {
		status: OrderStatus;
	}

	let { status }: Props = $props();
</script>

<div
	class="mx-auto flex w-full flex-col overflow-hidden rounded-md border border-gray-300 md:max-w-md"
>
	<div class={`rounded-t-md p-2 text-white ${getStatusUIInfo(status).staticColor}`}>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 space-x-1 rounded-lg px-3 py-1 pr-2 text-sm">
				<Icon type={getStatusUIInfo(status).statusIcon} />
				<span class="font-semibold">{orderStatusMap[status]}</span>
			</div>

			<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
				<Skeleton class="h-4 w-32 rounded-lg" />
			</div>
		</div>
	</div>

	<div class="flex flex-1 flex-col bg-white p-1 text-sm">
		<div class="flex flex-1 flex-row justify-between">
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.CLOCK} />
						<span>Fecha</span>
					</div>
					<Skeleton class="h-4 w-28 rounded-md bg-gray-100" />
				</div>

				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.USER} />
						<span>Cliente</span>
					</div>
					<Skeleton class="h-4 w-28 rounded-md bg-gray-100" />
				</div>

				{#if status !== OrderStatus.QUOTE}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.TRUCK} />
							<span>Recogida</span>
						</div>
						<Skeleton class="h-4 w-28 rounded-md bg-gray-100" />
					</div>
				{/if}
			</div>
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.COINS} />
						<span>Pagado</span>
					</div>
					<Skeleton class="h-4 w-12 rounded-md bg-gray-100" />
				</div>
				{#if status === OrderStatus.FINISHED}
					<div>
						<div class="flex items-center gap-2 text-gray-600">
							<Icon type={IconType.LOCATION} />
							<span>Ubicación</span>
						</div>
						<Skeleton class="h-4 w-28 rounded-md bg-gray-100" />
					</div>
				{/if}
			</div>
		</div>

		<div class="text-1 m-1 rounded-md border border-gray-300 bg-neutral-50 px-2 py-2">
			<Skeleton class="h-4 w-full rounded-md bg-white" />
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex items-center justify-end border-t border-gray-300 bg-neutral-50 p-3">
		<Skeleton class="h-6 w-24 rounded-md " />
	</div>
</div>
