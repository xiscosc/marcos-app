<script lang="ts">
	import Button from '../button/Button.svelte';
	import { ButtonAction, ButtonStyle } from '../button/button.enum';
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

<div
	class="flex w-full flex-col items-center space-y-2 rounded-lg border bg-white p-2 md:flex-row md:space-x-4 md:space-y-0 md:p-4"
>
	<span class="md:truncate-none max-w-full flex-grow truncate text-gray-700 md:max-w-none"
		>{fileName}</span
	>
	<div class="flex w-full justify-end space-x-2 md:w-auto">
		<Button
			text={isVideo ? 'Ver' : 'Descargar'}
			icon={isVideo ? IconType.VIDEO : IconType.DOWNLOAD}
			action={ButtonAction.LINK}
			link={downloadUrl}
			newWindow={true}
		/>

		<Button
			text="Eliminar"
			icon={IconType.TRASH}
			style={ButtonStyle.DELETE}
			action={ButtonAction.CLICK}
			onClick={deleteFile}
		/>
	</div>
</div>
