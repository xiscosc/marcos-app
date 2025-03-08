<script lang="ts">
	import '../app.css';
	import Box from '@/components/generic/Box.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { page } from '$app/state';

	let title = $derived(page.status === 404 ? 'Página no encontrada' : 'Error');
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#F7F5F2]">
	<div class="flex min-h-screen w-full items-center justify-center">
		<div class="w-full px-3 md:w-1/2 md:px-0 lg:w-1/3">
			<Box {title} icon={IconType.ALERT}>
				<div class="flex flex-col gap-2">
					<div class="flex w-full justify-center">
						<img
							class="w-1/3"
							src="https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png"
							alt="logo"
						/>
					</div>
					<span class="text-center">
						{#if page.status === 404}
							La página que estás buscando no existe, si el problema persiste, contacta con el
							administrador.
						{:else}
							Ha ocurrido un error, si el problema persiste, contacta con el administrador.
						{/if}
					</span>
					<span class="w-full pt-5 text-center font-semibold"> Marcos App </span>
				</div>
			</Box>
		</div>
	</div>
</div>
