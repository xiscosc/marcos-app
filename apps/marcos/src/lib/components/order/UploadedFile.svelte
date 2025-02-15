<script lang="ts">
	import Step from '../Step.svelte';
	import Button from '../button/Button.svelte';
	import { ButtonAction } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';

	interface Props {
		isVideo?: boolean;
		id?: string;
		fileName?: string;
		downloadUrl?: string;
		onDelete?: any;
	}

	let {
		isVideo = false,
		id = '',
		fileName = '',
		downloadUrl = '',
		onDelete = async (id: string) => {}
	}: Props = $props();

	async function deleteFile() {
		await onDelete(id);
	}
</script>

{#snippet viewButton()}
	<Button
		text=""
		icon={isVideo ? IconType.EYE : IconType.DOWNLOAD}
		action={ButtonAction.LINK}
		link={downloadUrl}
		newWindow={true}
	/>
{/snippet}

<Step
	subtitle={isVideo ? 'Vídeo' : 'Archivo'}
	icon={isVideo ? IconType.VIDEO : IconType.DOCUMENT}
	title={fileName}
	showDelete={true}
	deleteFunction={deleteFile}
	otherAction={viewButton}
	deleteConfirmation={true}
></Step>
