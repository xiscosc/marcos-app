<script lang="ts">
	import type { File as MMSSFile } from '@marcsimolduressonsardina/core/type';
	import Icon from '../icon/Icon.svelte';
	import { IconType } from '../icon/icon.enum';
	import ProgressBar from '../ProgressBar.svelte';

	interface Props {
		files: MMSSFile[];
		deleteFunction: (id: string) => Promise<void>;
	}

	let { files, deleteFunction }: Props = $props();
	let currentIndex = $state(0);
	let isOpen = $state(false);
	let isLoading = $state(false);

	function handleDelete() {
		closeGallery();
		deleteFunction(files[currentIndex].id);
	}

	function next(e: Event) {
		e.stopPropagation();
		isLoading = true;
		currentIndex = (currentIndex + 1) % files.length;
	}

	function previous(e: Event) {
		e.stopPropagation();
		isLoading = true;
		currentIndex = (currentIndex - 1 + files.length) % files.length;
	}

	function closeGallery() {
		isOpen = false;
	}

	function openGallery(index: number) {
		currentIndex = index;
		isLoading = true;
		isOpen = true;
	}

	function imageLoaded() {
		isLoading = false;
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each files as file, i}
		<button class="aspect-square w-16 overflow-hidden rounded-sm" onclick={() => openGallery(i)}>
			<img
				src={file.thumbnailDownloadUrl ?? file.downloadUrl}
				alt={file.originalFilename}
				class="h-full w-full object-cover transition-transform hover:scale-105"
			/>
		</button>
	{/each}
</div>

{#if isOpen}
	<div class="fixed inset-0 z-50">
		<!-- Backdrop -->
		<div
			aria-label="Close gallery"
			tabindex="0"
			class="absolute inset-0 bg-white/90 backdrop-blur"
			onclick={() => closeGallery()}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					closeGallery();
				}
			}}
			role="button"
		></div>

		<!-- Modal Content -->
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			{#if isLoading}
				<!-- Spinner or loading indicator -->
				<div class="absolute inset-0 flex items-center justify-center">
					<ProgressBar text="Cargando imagen" />
				</div>
			{/if}
			<img
				src={files[currentIndex].downloadUrl}
				alt={files[currentIndex].originalFilename}
				onload={imageLoaded}
				class:hidden={isLoading}
				class="pointer-events-auto max-h-[90vh] max-w-[90vw] rounded-sm object-contain"
			/>
		</div>

		<!-- Buttons on the Blur -->
		<button
			class:hidden={files.length === 1}
			class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
			onclick={(e) => {
				e.stopPropagation();
				previous(e);
			}}
		>
			<Icon type={IconType.LEFT}></Icon>
		</button>
		<button
			class:hidden={files.length === 1}
			class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
			onclick={(e) => {
				e.stopPropagation();
				next(e);
			}}
		>
			<Icon type={IconType.RIGHT}></Icon>
		</button>
		<div class="absolute right-4 top-4 flex flex-row gap-1">
			<button
				class="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
				onclick={(e) => {
					e.stopPropagation();
					closeGallery();
				}}
			>
				<Icon type={IconType.CLOSE}></Icon>
			</button>
			<button
				class="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
				onclick={(e) => {
					e.stopPropagation();
					handleDelete();
				}}
			>
				<Icon type={IconType.TRASH}></Icon>
			</button>
		</div>
	</div>
{/if}
