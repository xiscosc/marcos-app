<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Icon from './icon/Icon.svelte';
	import { IconType } from './icon/icon.enum';
	import { ButtonStyle, ButtonText, ButtonType } from './button/button.enum';

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
</script>

<Sheet.Root>
	<Sheet.Trigger class={`${customTriggerStyle ? '' : classes} lg:hidden`} {disabled}>
		{@render trigger()}
	</Sheet.Trigger>
	<Sheet.Content side="bottom">
		<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-4">
			<Sheet.Header class="p-0">
				{#if title}
					<Sheet.Title class="text-xl">
						<div class="flex flex-row items-center justify-center gap-2 md:justify-start">
							{#if iconType}
								<Icon type={iconType}></Icon>
							{/if}
							<span>{title}</span>
						</div>
					</Sheet.Title>
				{/if}
				{#if description}
					<Sheet.Description>{description}</Sheet.Description>
				{/if}
			</Sheet.Header>
			<div>
				{@render action()}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>

<Dialog.Root>
	<Dialog.Trigger class={`${customTriggerStyle ? '' : classes} hidden lg:block`} {disabled}>
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Content>
		<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-4">
			<Dialog.Header class="p-0">
				{#if title}
					<Dialog.Title class="text-xl">
						<div class="flex flex-row items-center justify-center gap-2 md:justify-start">
							{#if iconType}
								<Icon type={iconType}></Icon>
							{/if}
							<span>{title}</span>
						</div>
					</Dialog.Title>
				{/if}
				{#if description}
					<Dialog.Description>{description}</Dialog.Description>
				{/if}
			</Dialog.Header>
			<div>
				{@render action()}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
