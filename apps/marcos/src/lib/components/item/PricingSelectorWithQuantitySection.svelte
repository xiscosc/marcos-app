<script lang="ts">
	import Spacer from './Spacer.svelte';
	import type { ListPrice } from '@marcsimolduressonsardina/core/type';
	import Button from '../button/Button.svelte';
	import { IconSize, IconType } from '../icon/icon.enum';
	import Label from '../ui/label/label.svelte';
	import * as NativeSelect from '../ui/native-select/index.js';

	interface Props {
		added: boolean;
		sectionTitle: string;
		label: string;
		prices: ListPrice[];
		addItem: (id: string, quantity: number) => void;
	}

	let { added, sectionTitle, label, prices, addItem }: Props = $props();
	let selectedId: string | undefined = $state();
	let selectedQuantity: string = $state('1');

	function addElement() {
		if (selectedId != null && selectedQuantity != null) {
			addItem(selectedId, parseInt(selectedQuantity));
		}

		if (selectedQuantity != null) {
			selectedQuantity = '1';
		}
	}
</script>

<Spacer title={sectionTitle} />

<div class="flex flex-col gap-2 lg:col-span-2">
	<div class="flex flex-col gap-2 lg:flex-row">
		<div class="flex flex-1 flex-col gap-2">
			<Label for="predefinedElements">{label}:</Label>
			<NativeSelect.Root name="predefinedElements" bind:value={selectedId} success={added}>
				<option></option>
				{#each prices.sort((a, b) => b.priority - a.priority) as otherPrice}
					<option value={otherPrice.id}
						>{otherPrice.description} ({otherPrice.price.toFixed(2)} €)</option
					>
				{/each}
			</NativeSelect.Root>
		</div>

		<div class="flex flex-1 flex-col gap-2">
			<Label for="predefinedQuantityElements">Cantidad:</Label>
			<NativeSelect.Root name="predefinedQuantityElements" bind:value={selectedQuantity}>
				{#each Array(10) as _, i (i)}
					<option value={String(i + 1)}>{i + 1}</option>
				{/each}
			</NativeSelect.Root>
		</div>
	</div>
	<div class="lg:col-span-2">
		<Button
			text="Añadir a la lista"
			onClick={() => addElement()}
			icon={IconType.PLUS}
			iconSize={IconSize.BIG}
		></Button>
	</div>
</div>
