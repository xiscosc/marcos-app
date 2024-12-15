<script lang="ts">
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
	import Skeleton from '../ui/skeleton/skeleton.svelte';
</script>

<div
	class="mx-auto flex w-full flex-col overflow-hidden rounded-md border border-gray-300 md:max-w-md"
>
	<div class={`rounded-t-md bg-gray-400 p-2 text-white`}>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 space-x-1 rounded-lg px-3 py-1 pr-2 text-sm">
				<Icon type={IconType.LOADING} />
			</div>

			<div class="overflow-hidden overflow-ellipsis whitespace-nowrap text-[0.6rem]">
				<Skeleton class="h-5 w-32 rounded-lg" />
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
					<Skeleton class="h-5 w-28 rounded-md bg-gray-100" />
				</div>

				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.USER} />
						<span>Cliente</span>
					</div>
					<Skeleton class="h-5 w-28 rounded-md bg-gray-100" />
				</div>

				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.TRUCK} />
						<span>Recogida</span>
					</div>
					<Skeleton class="h-5 w-28 rounded-md bg-gray-100" />
				</div>
			</div>
			<div class="space-y-3 p-3 text-sm">
				<div>
					<div class="flex items-center gap-2 text-gray-600">
						<Icon type={IconType.COINS} />
						<span>Pagado</span>
					</div>
					<Skeleton class="h-5 w-12 rounded-md bg-gray-100" />
				</div>
			</div>
		</div>

		<div class="text-1 m-1 rounded-md border border-gray-300 bg-neutral-50 px-2 py-2">
			<Skeleton class="h-5 w-full rounded-md bg-white" />
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex items-center justify-end border-t border-gray-300 bg-neutral-50 p-3">
		<Skeleton class="h-8 w-20 rounded-md " />
	</div>
</div>
