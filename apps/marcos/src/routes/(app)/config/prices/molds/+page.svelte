<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Box from '$lib/components/Box.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Banner from '$lib/components/Banner.svelte';
	import { Input } from '$lib/components/ui/input';
	import SimpleHeading from '$lib/components/SimpleHeading.svelte';

	let files: FileList | undefined = $state();
	let loadingText = $state('');
	let loading = $state(false);

	async function loadFile() {
		if (validFile() && files != null) {
			const { filename, url } = await getUploadParams();
			const file = files![0];
			loadingText = 'Cargando archivo...';
			loading = true;
			const uploadResult = await uploadToS3(url, file);
			if (uploadResult) {
				loadingText = 'Procesando archivo...';
				const processingResult = await startProcessing(filename);
				cleanUpload();
				if (processingResult) {
					loadingText = '';
					toast.success('Precios actualizados correctamente');
				}
			} else {
				cleanUpload();
			}
		}
	}

	function cleanUpload() {
		files = undefined;
		loading = false;
	}

	function validFile(): boolean {
		if (files == null || files.length !== 1) {
			toast.error('Por favor, seleccione un archivo');
			return false;
		} else {
			const file = files[0];
			const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
			const validExtensions = ['xls', 'xlsx'];

			if (!validExtensions.includes(fileExtension)) {
				toast.error('Por favor, seleccione un archivo Excel (.xls o .xlsx)');
				cleanUpload();
				return false;
			}
		}

		return true;
	}

	async function getUploadParams(): Promise<{ filename: string; url: string }> {
		const response = await fetch('/api/prices/molds/upload', {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		return await response.json();
	}

	async function startProcessing(filename: string): Promise<boolean> {
		try {
			const response = await fetch('/api/prices/molds/upload', {
				method: 'POST',
				body: JSON.stringify({ filename }),
				headers: {
					'content-type': 'application/json'
				}
			});
			if (response.ok) {
				return true;
			} else {
				toast.error(
					'Ocurrió un error al procesar el archivo. Puede deberse a un error de formato.'
				);
				return false;
			}
		} catch (error) {
			toast.error('Ocurrió un error al procesar el archivo. Puede deberse a un error de formato.');
			return false;
		}
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
</script>

<Toaster richColors />

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.MOLD}>Carga de precios de Marcos/Molduras</SimpleHeading>
	<Box>
		<div class="flex flex-col gap-2">
			<Banner
				title="Formato del archivo"
				icon={IconType.QUESTION}
				text="Columna A: Casillero, Columna B: Referencia, Columna C: Precio, Columna D: Flotante (casilla igual a S)"
				colorName="indigo"
			/>
			<div
				class="flex w-full flex-col place-content-center items-center justify-center space-y-4 px-2 py-4"
			>
				{#if loading}
					<ProgressBar text={loadingText} />
				{:else}
					<Input id="moldFile" type="file" bind:files />
					<Button text="Cargar archivo excel" icon={IconType.EXCEL} onClick={loadFile}></Button>
				{/if}
			</div>
		</div>
	</Box>
</div>
