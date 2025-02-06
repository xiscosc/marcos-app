<script lang="ts">
	import Box from '$lib/components/Box.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
</script>

<div class="flex min-h-screen w-full items-center justify-center">
	<div class="w-full px-3 md:w-1/2 md:px-0 lg:w-1/3">
		<Box title="Fuera de servicio" icon={IconType.CLOCK}>
			<div class="flex flex-col gap-2">
				<div class="flex w-full justify-center">
					<img
						class="w-1/2"
						src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
						alt="logo"
					/>
				</div>
				<span>
					La aplicación se encuentra en mantenimiento en estos momentos, disculpe las molestias. Se
					reestablecerá el servicio lo antes posible.
				</span>
				<span class="w-full pt-5 text-center font-semibold"> Marcos App </span>
			</div>
		</Box>
	</div>
</div>
