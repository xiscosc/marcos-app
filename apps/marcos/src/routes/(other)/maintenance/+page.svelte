<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
</script>

<div class="flex min-h-0 items-center justify-center pt-5 md:min-h-screen md:pt-0">
	<div class="space-y-3 px-4 md:w-1/4 md:px-0">
		<div class="flex w-full justify-center">
			<img
				class="w-1/2"
				src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
				alt="logo"
			/>
		</div>

		<Box title="Fuera de servicio" icon={IconType.CLOCK}>
			<div class="flex flex-col gap-2">
				<span>
					La aplicación se encuentra en mantenimiento en estos momentos, disculpe las molestias. Se
					reestablecerá el servicio lo antes posible.
				</span>
				<span class="w-full pt-5 text-center font-semibold"> Marcos App </span>
			</div>
		</Box>
	</div>
</div>
