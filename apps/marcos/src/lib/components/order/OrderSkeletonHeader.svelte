<script lang="ts">
	import Icon from '../icon/Icon.svelte';
	import { IconType } from '../icon/icon.enum';
	import Skeleton from '../ui/skeleton/skeleton.svelte';
</script>

<div class="overflow-hidden rounded-md border border-gray-50">
	<div class="flex items-center justify-between bg-gray-400 px-3 py-2 text-white">
		<span class="flex items-center px-2 text-lg font-semibold">
			<span class="flex items-center gap-2">
				<div class="animate-bounce"><Icon type={IconType.LOADING} /></div>
				Pedido
			</span>
		</span>
		<Skeleton class="h-4 w-32 rounded-lg" />
	</div>

	<div class="space-y-1 bg-white px-2 py-4">
		<Skeleton class="h-10 w-full rounded-lg" />
		<Skeleton class="h-10 w-full rounded-lg" />
		<Skeleton class="h-10 w-full rounded-lg" />

		<div class="flex items-end justify-between px-2 pt-1">
			<div class="flex items-center text-xl font-bold text-gray-800">
				<Skeleton class="h-4 w-16" />
				<span> €</span>
			</div>

			<div class="flex items-center gap-1 text-xs text-gray-700">
				<Icon type={IconType.CLOCK} />
				<span><Skeleton class="h-4 w-16" /></span>
			</div>
		</div>
	</div>
</div>
