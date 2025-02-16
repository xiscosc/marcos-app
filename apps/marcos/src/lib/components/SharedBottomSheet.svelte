<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Icon from './icon/Icon.svelte';
	import { isSmBreakpoint } from '@/stores/breakpoint.svelte';
	import { navigating } from '$app/state';
	import {
		bottomSheetActionStore,
		bottomSheetDescriptionStore,
		bottomSheetIconStore,
		bottomSheetOpenStore,
		bottomSheetTitleStore,
		closeBottomSheet
	} from '@/stores/bottomSheet.svelte';

	$effect(() => {
		if (navigating.from) {
			closeBottomSheet();
		}
	});
</script>

{#if $isSmBreakpoint}
	<Sheet.Root bind:open={$bottomSheetOpenStore}>
		<Sheet.Content
			side="bottom"
			onOpenAutoFocus={(e) => {
				e.preventDefault();
			}}
		>
			<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-4">
				<Sheet.Header class="p-0">
					{#if $bottomSheetTitleStore}
						<Sheet.Title class="text-xl">
							<div class="flex flex-row items-center justify-center gap-2 md:justify-start">
								{#if $bottomSheetIconStore}
									<Icon type={$bottomSheetIconStore}></Icon>
								{/if}
								<span>{$bottomSheetTitleStore}</span>
							</div>
						</Sheet.Title>
					{/if}
					{#if $bottomSheetDescriptionStore}
						<Sheet.Description>{$bottomSheetDescriptionStore}</Sheet.Description>
					{/if}
				</Sheet.Header>
				<div>
					{@render $bottomSheetActionStore?.()}
				</div>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{:else}
	<Dialog.Root bind:open={$bottomSheetOpenStore}>
		<Dialog.Content
			onOpenAutoFocus={(e) => {
				e.preventDefault();
			}}
		>
			<div class="mx-auto flex w-full max-w-sm flex-col gap-2 p-4">
				<Dialog.Header class="p-0">
					{#if $bottomSheetTitleStore}
						<Dialog.Title class="text-xl">
							<div class="flex flex-row items-center justify-center gap-2 md:justify-start">
								{#if $bottomSheetIconStore}
									<Icon type={$bottomSheetIconStore}></Icon>
								{/if}
								<span>{$bottomSheetTitleStore}</span>
							</div>
						</Dialog.Title>
					{/if}
					{#if $bottomSheetDescriptionStore}
						<Dialog.Description>{$bottomSheetDescriptionStore}</Dialog.Description>
					{/if}
				</Dialog.Header>
				<div>
					{@render $bottomSheetActionStore?.()}
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
