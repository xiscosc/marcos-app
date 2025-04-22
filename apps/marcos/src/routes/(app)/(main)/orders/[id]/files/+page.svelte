<script lang="ts">
	import type { PageData } from './$types';
	import { Toaster, toast } from 'svelte-sonner';
	import { FileType, type File as MMSSFile } from '@marcsimolduressonsardina/core/type';
	import ProgressBar from '@/components/generic/ProgressBar.svelte';
	import UploadedFile from '@/components/business-related/file/UploadedFile.svelte';
	import { goto } from '$app/navigation';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonAction, ButtonType } from '@/components/generic/button/button.enum';
	import Box from '@/components/generic/Box.svelte';
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import { Input } from '@/components/ui/input';
	import Photos from '@/components/business-related/file/Photos.svelte';
	import { featureFlags, runWhenFeatureIsEnabled } from '@/shared/feature-flags';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let inputFiles: FileList | undefined = $state();
	let loading = $state(false);
	let loadingText = $state('');
	let files = $state(data.files ?? []);

	let noArtEnabled = $state(false);
	let photos = $derived(files.filter((f) => f.type === FileType.PHOTO));
	let videos = $derived(files.filter((f) => f.type === FileType.VIDEO));
	let other = $derived(files.filter((f) => f.type === FileType.OTHER));
	let noArt = $derived(files.filter((f) => f.type === FileType.NO_ART));

	async function deleteFile(id: string) {
		loadingText = 'Eliminando archivo, por favor no cierre la ventana';
		loading = true;
		const response = await fetch(`/api/orders/${data!.order!.id}/files/${id}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toast.error('Error al eliminar el fichero');
			loading = false;
			return;
		}

		loading = false;
		files = files.filter((f) => f.id != id);
	}

	async function createNoArtFile() {
		loadingText = 'Cargando archivo, por favor no cierre la ventana';
		loading = true;
		const response = await fetch(`/api/orders/${data!.order!.id}/files`, {
			method: 'POST',
			body: JSON.stringify({ filename: 'Sin obra', fileType: FileType.NO_ART }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toast.error('Error al procesar el fichero');
			return;
		}

		const file = (await response.json()) as MMSSFile;
		files = [...files, file];
		loading = false;
	}

	async function createFile(filename: string): Promise<MMSSFile | undefined> {
		const response = await fetch(`/api/orders/${data!.order!.id}/files`, {
			method: 'POST',
			body: JSON.stringify({ filename }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toast.error('Error al procesar el fichero');
			return;
		}

		const file = (await response.json()) as MMSSFile;
		return file;
	}

	async function getFile(id: string): Promise<MMSSFile | undefined> {
		const response = await fetch(`/api/orders/${data!.order!.id}/files/${id}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.status !== 200) {
			toast.error('Error al obtener fichero');

			return;
		}

		const file = (await response.json()) as MMSSFile;
		return file;
	}

	async function loadFile() {
		if (inputFiles == null || inputFiles.length === 0) {
			toast.error('Debes seleccionar un archivo');
			return;
		}

		loadingText = 'Cargando archivo, por favor no cierre la ventana';
		loading = true;
		const filesToUpload = [...inputFiles];
		const uploads = filesToUpload.map((f) => uploadIndividualFile(f));
		const results = await Promise.all(uploads);
		const uploadedFiles = results.filter((f) => f != null);
		files = [...files, ...uploadedFiles];
		inputFiles = undefined;
		loading = false;

		if (results.filter((f) => f == null).length > 0) {
			toast.error('Algunos archivos no pudieron cargarse');
		}
	}

	async function uploadIndividualFile(fileToUpload: File): Promise<MMSSFile | undefined> {
		const file = await createFile(fileToUpload.name);
		if (file == null) return;
		await uploadToS3(file.uploadUrl!, fileToUpload);
		return getFile(file.id);
	}

	async function uploadToS3(presignedUrl: string, file: File): Promise<boolean> {
		try {
			const response = await fetch(presignedUrl, {
				method: 'PUT',
				body: file
			});

			if (response.ok) {
				return true;
			} else {
				toast.error('Ocurrió un error al cargar el archivo. Por favor, intente nuevamente.');
				return false;
			}
		} catch (error) {
			toast.error('Ocurrió un error al cargar el archivo. Por favor, intente nuevamente.');
			return false;
		}
	}

	onMount(() => {
		runWhenFeatureIsEnabled(featureFlags.noArtUploader, () => {
			noArtEnabled = true;
		});
	});
</script>

<Toaster richColors />

<div class="flex flex-col gap-4">
	<div class="flex w-full flex-row items-end justify-between">
		<SimpleHeading icon={IconType.CAMERA}>Archivos y fotos</SimpleHeading>

		{#if !loading}
			<Button
				text="Volver al pedido"
				icon={IconType.ORDER_PICKED_UP}
				onClick={() => goto(`/orders/${data!.order!.id}`)}
				buttonType={ButtonType.SMALL}
			></Button>
		{/if}
	</div>

	{#if loading}
		<Box>
			<ProgressBar text={loadingText} />
		</Box>
	{:else}
		<div class="flex flex-col gap-2">
			<Box title="Carga de archivos">
				<div class="flex flex-col gap-2 md:flex-row">
					<Input type="file" bind:files={inputFiles} onchange={loadFile} multiple />
				</div>
			</Box>

			{#if noArtEnabled && files.length === 0}
				<Box title="Sin Obra">
					<div class="flex flex-col gap-2 md:flex-row">
						<Button
							action={ButtonAction.CLICK}
							onClick={() => createNoArtFile()}
							text="Añadir archivo Sin Obra"
							icon={IconType.ADD}
						></Button>
					</div>
				</Box>
			{/if}

			{#if photos.length > 0}
				<Box title="Fotos" collapsible>
					<Photos files={photos} deleteFunction={deleteFile} />
				</Box>
			{/if}

			{#if videos.length > 0}
				<Box title="Vídeos" collapsible>
					<div class="flex flex-col gap-2">
						{#each videos as file}
							<UploadedFile
								fileType={FileType.VIDEO}
								fileName={file.originalFilename}
								downloadUrl={file.downloadUrl}
								onDelete={deleteFile}
								id={file.id}
							/>
						{/each}
					</div>
				</Box>
			{/if}

			{#if other.length > 0 || noArt.length > 0}
				<Box title="Otros archivos" collapsible>
					<div class="flex flex-col gap-2">
						{#each other as file}
							<UploadedFile
								fileType={file.type}
								fileName={file.originalFilename}
								downloadUrl={file.downloadUrl}
								onDelete={deleteFile}
								id={file.id}
							/>
						{/each}
						{#each noArt as file}
							<UploadedFile
								fileType={file.type}
								fileName={file.originalFilename}
								onDelete={deleteFile}
								id={file.id}
							/>
						{/each}
					</div>
				</Box>
			{/if}
		</div>
	{/if}
</div>
