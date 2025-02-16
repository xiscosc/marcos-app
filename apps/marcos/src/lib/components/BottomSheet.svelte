<script lang="ts">
	import type { Snippet } from 'svelte';
	import { IconType } from './icon/icon.enum';
	import { ButtonStyle, ButtonText, ButtonType } from './button/button.enum';
	import { setBottomSheet, openBottomSheet, closeBottomSheet } from '@/stores/bottomSheet.svelte';

	interface Props {
		title?: string;
		iconType?: IconType;
		disabled?: boolean;
		description?: string;
		trigger: Snippet;
		action: Snippet;
		triggerStyle?: ButtonStyle;
		triggerTextType?: ButtonText;
		triggerbuttonType?: ButtonType;
		customTriggerStyle?: boolean;
	}

	let {
		title = undefined,
		description = undefined,
		trigger,
		action,
		disabled = false,
		iconType = undefined,
		triggerStyle = ButtonStyle.NEUTRAL,
		triggerTextType = ButtonText.WHITE,
		triggerbuttonType = ButtonType.DEFAULT,
		customTriggerStyle = false
	}: Props = $props();

	const classes = $derived(
		`${triggerbuttonType} ${disabled ? ButtonStyle.DISABLED : triggerStyle} ${triggerTextType} ${triggerbuttonType === ButtonType.SMALL ? 'flex items-center' : ''} ${triggerbuttonType !== ButtonType.SMALL ? 'w-full' : ''}`
	);

	function handleClick() {
		closeBottomSheet();
		setBottomSheet(title, description, iconType, action);
		openBottomSheet();
	}
</script>

<button
	class={`${customTriggerStyle ? '' : classes} cursor-pointer`}
	{disabled}
	onclick={handleClick}
	type="button"
>
	{@render trigger()}
</button>
