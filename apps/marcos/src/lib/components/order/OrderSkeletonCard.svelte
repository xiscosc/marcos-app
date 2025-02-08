<script lang="ts">
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';
	import Skeleton from '../ui/skeleton/skeleton.svelte';
</script>

{#snippet infoPiece(icon: IconType, title: string)}
	<div class="flex flex-col">
		<div class="flex items-center gap-2 text-gray-600">
			<Icon type={icon} />
			<span>{title}</span>
		</div>
		<Skeleton class="h-5 w-28 rounded-md bg-gray-100" />
	</div>
{/snippet}

<div class="mx-auto flex w-full flex-col overflow-hidden rounded-md md:max-w-md">
	<div class={`rounded-t-md bg-gray-400 p-2 text-white`}>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 space-x-1 rounded-lg px-3 py-1 pr-2 text-sm">
				<Icon type={IconType.LOADING} />
			</div>

			<div class="overflow-hidden text-ellipsis whitespace-nowrap text-[0.6rem]">
				<Skeleton class="h-5 w-32 rounded-lg" />
			</div>
		</div>
	</div>

	<div class="flex flex-1 flex-col bg-white p-1 text-sm">
		<div class="grid flex-1 auto-rows-max grid-cols-2 items-start gap-2 p-3">
			{@render infoPiece(IconType.CLOCK, 'Fecha')}
			{@render infoPiece(IconType.USER, 'Cliente')}
			{@render infoPiece(IconType.TRUCK, 'Recogida')}
			{@render infoPiece(IconType.COINS, 'Pagado')}
			{@render infoPiece(IconType.RULER, 'Medidas')}
			{@render infoPiece(IconType.MOLD, 'Moldura')}
		</div>

		<div class="text-1 m-1 mt-6 rounded-md border border-gray-100 bg-gray-50 px-2 py-2">
			<Skeleton class="h-5 w-full rounded-md bg-white" />
		</div>
	</div>

	<!-- Footer Section -->
	<div class="flex items-center justify-end bg-white p-3">
		<Skeleton class="h-8 w-20 rounded-md " />
	</div>
</div>
