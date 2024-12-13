<script lang="ts">
	import { stopPropagation, createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		imageUrl?: string;
		id?: string;
		visible?: boolean;
		onClose?: any;
		onDelete?: any;
		onNext?: any;
		onPrevious?: any;
	}

	let {
		imageUrl = '',
		id = '',
		visible = $bindable(false),
		onClose = () => {},
		onDelete = async (id: string) => {},
		onNext = (id: string) => {},
		onPrevious = (id: string) => {}
	}: Props = $props();

	async function handleDelete() {
		await onDelete(id);
	}

	function handleNext() {
		onNext(id);
	}

	function handlePrevious() {
		onPrevious(id);
	}
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
		onclick={onClose}
	>
		<div class="absolute right-4 top-4 flex space-x-2">
			<button
				class="flex items-center justify-center gap-2 rounded-md bg-red-600 p-2 text-white shadow-lg hover:bg-red-700 focus:outline-none"
				onclick={stopPropagation(handleDelete)}
			>
				<Icon type={IconType.TRASH} /> Eliminar
			</button>
			<button
				class="flex items-center justify-center gap-2 rounded-md bg-gray-600 p-2 text-white shadow-lg hover:bg-gray-700 focus:outline-none"
				onclick={stopPropagation(onClose)}
			>
				<Icon type={IconType.CLOSE} /> Cerrar
			</button>
		</div>
		<button
			class="absolute left-4 top-1/2 flex -translate-y-1/2 transform items-center justify-center rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
			onclick={stopPropagation(handlePrevious)}
		>
			<Icon type={IconType.LEFT} />
		</button>
		<button
			class="absolute right-4 top-1/2 flex -translate-y-1/2 transform items-center justify-center rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
			onclick={stopPropagation(handleNext)}
		>
			<Icon type={IconType.RIGHT} />
		</button>
		<img
			src={imageUrl}
			class="max-h-full max-w-full object-contain shadow-lg"
			onclick={stopPropagation(bubble('click'))}
		/>
	</div>
{/if}
