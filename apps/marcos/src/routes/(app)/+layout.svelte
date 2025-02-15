<script lang="ts">
	import type { LayoutData } from './$types';
	import { navigating } from '$app/state';
	import '../../app.css';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Box from '$lib/components/Box.svelte';
	import { onMount, type Snippet } from 'svelte';
	import { initPosthog } from '@/shared/analytics.utilities';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	onMount(() => {
		initPosthog(data.envName);
	});

	let onTesting = $state(data.envName !== 'prod');
	let headerBackgroundClasses = $derived(
		!onTesting ? 'bg-white/90 border-gray-50' : 'bg-red-500/80 border-red-500/80'
	);
</script>

<svelte:head>
	<title>Marcs i Moldures Son Sardina</title>
</svelte:head>
<div class="flex min-h-screen flex-col bg-[#F7F5F2]">
	<header
		class={`sticky top-0 z-20 flex items-center justify-center border-b p-3 backdrop-blur-sm ${headerBackgroundClasses}`}
	>
		<div
			class="flex w-full flex-row items-center justify-between px-1 md:px-2 lg:max-w-[1650px] lg:px-3"
		>
			<a href="/" class="text-black">
				<Icon type={IconType.HOME} />
			</a>

			<div
				class="pointer-events-none absolute inset-0 flex w-full items-center justify-center gap-3"
			>
				{#if onTesting}
					<span class="text-md font-semibold"> ENTORNO DE PRUEBAS ({data.envName}) </span>
				{:else}
					<Icon type={IconType.LOGO} />
				{/if}
			</div>

			<div class="flex items-center gap-3">
				{#if data.user.priceManager}
					<a href="/config" class="text-black">
						<Icon type={IconType.SETTINGS} />
					</a>
				{/if}
				<a href="/auth/signout?callbackUrl=/" class="text-black">
					<Icon type={IconType.LOGOUT} />
				</a>
			</div>
		</div>
	</header>

	<!-- Scrollable Content Block filling remaining space -->
	<main class="flex-1 overflow-y-auto p-2">
		<div class="mx-auto w-full px-1 pb-3 md:px-2 md:pb-0 md:pt-2 lg:max-w-[1650px] lg:px-4">
			{#if navigating.from != null}
				<Box>
					<ProgressBar></ProgressBar>
				</Box>
			{:else}
				{@render children?.()}
			{/if}
		</div>
	</main>
</div>
