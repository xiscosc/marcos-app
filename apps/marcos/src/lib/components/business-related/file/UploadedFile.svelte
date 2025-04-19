<script lang="ts">
	import Step from '@/components/generic/Step.svelte';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonAction } from '@/components/generic/button/button.enum';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import { FileType } from '@marcsimolduressonsardina/core/type';

	interface Props {
		id?: string;
		fileName?: string;
		downloadUrl?: string;
		onDelete?: any;
		fileType: FileType;
	}

	let {
		id = '',
		fileName = '',
		downloadUrl = undefined,
		fileType,
		onDelete = async (id: string) => {}
	}: Props = $props();

	async function deleteFile() {
		await onDelete(id);
	}

	let subtitle = $derived(
		fileType === FileType.VIDEO
			? 'Vídeo'
			: fileType === FileType.NO_ART
				? 'Archivo por defecto'
				: 'Archivo'
	);
	let downloadIcon = $derived(fileType === FileType.VIDEO ? IconType.EYE : IconType.DOWNLOAD);
	let icon = $derived(
		fileType === FileType.VIDEO
			? IconType.VIDEO
			: fileType === FileType.NO_ART
				? IconType.CLOSE
				: IconType.DOCUMENT
	);
</script>

{#snippet downloadButton()}
	<Button
		text=""
		icon={downloadIcon}
		action={ButtonAction.LINK}
		link={downloadUrl}
		newWindow={true}
		disabled={downloadUrl == null}
	/>
{/snippet}

<Step
	{subtitle}
	{icon}
	title={fileName}
	showDelete={true}
	deleteFunction={deleteFile}
	otherAction={downloadButton}
	deleteConfirmation={true}
></Step>
