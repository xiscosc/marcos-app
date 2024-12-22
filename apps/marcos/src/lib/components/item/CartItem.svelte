<script lang="ts">
	import type { CalculatedItemPart } from '@marcsimolduressonsardina/core/type';
	import { IconType } from '../icon/icon.enum';
	import Step from '../Step.svelte';

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

<Step
	icon={IconType.CART}
	title="{part.description}{noDiscountAllowed ? '*' : ''} {part.floating ? '(Flot)' : ''}"
	subtitle="{(part.price * part.quantity).toFixed(2)} €"
	quantity={part.quantity}
	deleteFunction={() => deleteExtraPart(partToDelete)}
	showDelete={!hideDeleteButton}
/>
