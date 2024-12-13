<script lang="ts">
	import Spacer from './Spacer.svelte';
	import type { ListPrice } from '@marcsimolduressonsardina/core/type';
	import Button from '../button/Button.svelte';
	import { IconSize, IconType } from '../icon/icon.enum';
	import Label from '../ui/label/label.svelte';
	import * as Select from '../ui/select/index.js';

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

	let selectedDescription = $derived(
		selectedId
			? (prices.find((p) => p.id === selectedId)?.description ?? 'Seleccionar')
			: 'Seleccionar'
	);
	let selectedPrice = $derived(
		selectedId
			? (((x) => `(${x} €)`)(prices.find((p) => p.id === selectedId)?.price.toFixed(2)) ?? '')
			: ''
	);
</script>

<Spacer title={sectionTitle} />

<div class="flex flex-col gap-2 lg:col-span-2">
	<div class="flex flex-row gap-2">
		<div class="flex flex-1 flex-col gap-2">
			<Label for="predefinedElements">{label}:</Label>
			<Select.Root type="single" name="predefinedElements" bind:value={selectedId}>
				<Select.Trigger success={added}>
					{selectedDescription}
					{selectedPrice}
				</Select.Trigger>
				<Select.Content>
					{#each prices.sort((a, b) => b.priority - a.priority) as otherPrice}
						<Select.Item value={otherPrice.id}
							>{otherPrice.description} ({otherPrice.price.toFixed(2)} €)</Select.Item
						>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex flex-1 flex-col gap-2">
			<Label for="predefinedQuantityElements">Cantidad:</Label>
			<Select.Root type="single" name="predefinedQuantityElements" bind:value={selectedQuantity}>
				<Select.Trigger success={added}>
					{selectedQuantity}
				</Select.Trigger>
				<Select.Content>
					{#each Array(10) as _, i (i)}
						<Select.Item value={String(i + 1)}>{i + 1}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
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
