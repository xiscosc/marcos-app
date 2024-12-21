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
		showNoDiscountAllowed?: boolean;
	}

	let {
		part,
		partToDelete = {},
		deleteExtraPart = (p: any) => {},
		hideDeleteButton = false,
		showNoDiscountAllowed = false
	}: Props = $props();

	let noDiscountAllowed = $derived(!part.discountAllowed && showNoDiscountAllowed);
</script>

<div class="flex flex-row justify-between">
	<div class="flex flex-row items-center gap-4">
		<span
			class="relative flex flex-row items-center gap-1 rounded-sm border bg-gray-900 p-2 text-white shadow-sm"
		>
			<div class="relative">
				<Icon type={IconType.CART} />
			</div>
			{#if part.quantity > 1}
				<span
					class="absolute -right-1 -top-1 rounded-full border border-red-800 bg-red-500 px-1.5 text-sm font-medium text-white"
				>
					{part.quantity}
				</span>
			{/if}
		</span>
		<div class="flex flex-col text-sm">
			<span class="font-medium">
				{part.description}{noDiscountAllowed ? '*' : ''}
				{part.floating ? '(Flot)' : ''}
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
