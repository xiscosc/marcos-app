<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import Icon from './icon/Icon.svelte';
	import { IconType } from './icon/icon.enum';
	import Progress from './ui/progress/progress.svelte';
	import { ButtonStyle, ButtonText, ButtonType } from './button/button.enum';

	interface Props {
		title: string;
		iconType: IconType;
		disabled?: boolean;
		description: string;
		loading: boolean;
		trigger: Snippet;
		action: Snippet;
		triggerStyle?: ButtonStyle;
		triggerTextType?: ButtonText;
		triggerbuttonType?: ButtonType;
	}

	let progressValue = $state(0);

	function animateToFull() {
		progressValue = 0; // Reset progress
		const interval = setInterval(() => {
			progressValue += 1; // Increment progress
			if (progressValue >= 100) {
				clearInterval(interval); // Stop animation at 100%
			}
		}, 5); // Adjust the speed (20ms for smoother animation)
	}

	$effect(() => {
		if (loading) {
			animateToFull();
		} else {
			progressValue = 0;
		}
	});

	let {
		title,
		description,
		loading,
		trigger,
		action,
		disabled = false,
		iconType,
		triggerStyle = ButtonStyle.NEUTRAL,
		triggerTextType = ButtonText.WHITE,
		triggerbuttonType = ButtonType.DEFAULT
	}: Props = $props();

	const classes = $derived(
		`${triggerbuttonType} ${disabled ? ButtonStyle.DISABLED : triggerStyle} ${triggerTextType} ${triggerbuttonType === ButtonType.SMALL ? 'flex items-center' : ''} ${triggerbuttonType !== ButtonType.SMALL ? 'w-full' : ''}`
	);
</script>

<Sheet.Root>
	<Sheet.Trigger class={classes} {disabled}>
		{@render trigger()}
	</Sheet.Trigger>
	<Sheet.Content side="bottom">
		<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-4">
			<Sheet.Header class="p-0">
				<Sheet.Title class="text-xl">
					<div class="flex flex-row items-center justify-center gap-2 md:justify-start">
						<Icon type={iconType}></Icon>
						<span>{title}</span>
					</div>
				</Sheet.Title>
				{#if !loading}
					<Sheet.Description>{description}</Sheet.Description>
				{/if}
			</Sheet.Header>
			<div>
				{#if loading}
					<div class="py-10">
						<Progress value={progressValue} />
					</div>
				{:else}
					{@render action()}
				{/if}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
