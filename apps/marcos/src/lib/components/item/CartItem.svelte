<script lang="ts">
	import type { CalculatedItemPart } from '@marcsimolduressonsardina/core/type';
	import Button from '../button/Button.svelte';
	import { ButtonStyle, ButtonText, ButtonType } from '../button/button.enum';
	import { IconType } from '../icon/icon.enum';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		part: CalculatedItemPart;
		partToDelete?: any;
		deleteExtraPart?: (partToDelete: any) => void;
		hideDeleteButton?: boolean;
	}

	let {
		part,
		partToDelete = {},
		deleteExtraPart = (p: any) => {},
		hideDeleteButton = false
	}: Props = $props();
</script>

<div class="flex flex-row justify-between">
	<div class="flex flex-row items-center gap-4">
		<span class="rounded-sm border bg-green-100 p-2 text-gray-800 shadow-sm"
			><Icon type={IconType.CART} /></span
		>
		<div class="flex flex-col">
			<span class="font-semibold">
				{part.description}
				{part.floating ? '(Flot)' : ''}
				{part.quantity > 1 ? `x ${part.quantity}` : ''}
			</span>
			<span>{(part.price * part.quantity).toFixed(2)} €</span>
		</div>
	</div>

	{#if !hideDeleteButton}
		<div class="flex flex-row items-center">
			<Button
				icon={IconType.TRASH}
				buttonType={ButtonType.DEFAULT}
				text=""
				textType={ButtonText.GRAY}
				style={ButtonStyle.SOFT_DELETE}
				onClick={() => deleteExtraPart(partToDelete)}
			></Button>
		</div>
	{/if}
</div>
