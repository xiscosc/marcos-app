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

<div
	class="flex w-full flex-row justify-between gap-2 rounded-md border border-gray-100 bg-gray-50 px-2 py-1"
>
	<div class="flex flex-row items-center justify-start gap-2">
		<div class="relative rounded-full border border-gray-100 bg-white p-2 text-gray-900">
			<div class="relative">
				<Icon type={IconType.CART} />
			</div>
			{#if part.quantity > 1}
				<span
					class="absolute -right-1 -top-1 rounded-full border border-red-800 bg-red-500 px-1 text-xs font-medium text-white"
				>
					{part.quantity}
				</span>
			{/if}
		</div>
		<div class="flex flex-col gap-1 text-sm">
			<span class="font-medium"
				>{part.description}{noDiscountAllowed ? '*' : ''}
				{part.floating ? '(Flot)' : ''}</span
			>
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
