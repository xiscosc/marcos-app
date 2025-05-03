<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		ButtonAction,
		ButtonStyle,
		ButtonText,
		ButtonType
	} from '@/components/generic/button/button.enum';
	import InnerButton from '@/components/generic/button/InnerButton.svelte';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
	import type { IconSize, IconType } from '@/components/generic/icon/icon.enum';

	interface Props {
		icon: IconType;
		iconSize?: IconSize;
		text: string;
		style?: ButtonStyle;
		disabled?: boolean;
		newWindow?: boolean;
		textType?: ButtonText;
		action?: ButtonAction;
		buttonType?: ButtonType;
		tooltipText?: string;
		link?: string;
		formAction?: string;
		onClick?: (event: MouseEvent) => void;
		trackFunction?: () => void;
	}

	let {
		icon,
		iconSize,
		text,
		style = ButtonStyle.NEUTRAL,
		disabled = false,
		newWindow = false,
		textType = ButtonText.WHITE,
		action = ButtonAction.CLICK,
		buttonType = ButtonType.DEFAULT,
		tooltipText = undefined,
		link = undefined,
		formAction = undefined,
		onClick = undefined,
		trackFunction = undefined
	}: Props = $props();

	function track() {
		if (trackFunction) {
			trackFunction();
		}
	}

	function handleClick(event: MouseEvent) {
		track();

		if (onClick) {
			onClick(event);
		}

		if (link) {
			goto(link);
		}
	}

	const classes = $derived(
		`${buttonType} ${disabled ? ButtonStyle.DISABLED : style} ${textType} ${buttonType === ButtonType.SMALL ? 'flex items-center' : ''}`
	);
</script>

{#if action === ButtonAction.TRIGGER}
	<InnerButton iconType={icon} {iconSize} {text} center={buttonType !== ButtonType.HOME}
	></InnerButton>
{:else if disabled}
	<div class="group relative" class:w-full={buttonType !== ButtonType.SMALL}>
		<button type="button" disabled class={classes} class:w-full={buttonType !== ButtonType.SMALL}>
			<InnerButton iconType={icon} {iconSize} {text} center={buttonType !== ButtonType.HOME}
			></InnerButton>
		</button>
		{#if tooltipText != null}
			<div
				class="absolute left-1/2 z-10 mt-2 hidden -translate-x-1/2 transform rounded-lg bg-gray-800 px-4 py-2 text-base text-white group-hover:flex"
			>
				<TriangleAlert class="mr-2" />
				<span>{tooltipText}</span>
			</div>
		{/if}
	</div>
{:else if action === ButtonAction.CLICK}
	<button
		type="button"
		class={classes}
		onclick={handleClick}
		class:w-full={buttonType !== ButtonType.SMALL}
	>
		<InnerButton iconType={icon} {iconSize} {text} center={buttonType !== ButtonType.HOME}
		></InnerButton>
	</button>
{:else if action === ButtonAction.LINK}
	<a
		class={classes}
		class:w-full={buttonType !== ButtonType.SMALL}
		href={link ?? '#'}
		onclick={() => track()}
		target={newWindow ? '_blank' : '_self'}
	>
		<InnerButton iconType={icon} {iconSize} {text} center={buttonType !== ButtonType.HOME}
		></InnerButton>
	</a>
{:else if action === ButtonAction.SUBMIT}
	<button
		class={classes}
		type="submit"
		class:w-full={buttonType !== ButtonType.SMALL}
		onclick={() => track()}
		formaction={formAction ?? null}
	>
		<InnerButton iconType={icon} {iconSize} {text} center={buttonType !== ButtonType.HOME}
		></InnerButton>
	</button>
{/if}
