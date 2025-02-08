<script lang="ts">
	import type { LayoutData } from './$types';
	import { navigating } from '$app/stores';
	import '../../app.pcss';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { IconType } from '$lib/components/icon/icon.enum';
	import Icon from '$lib/components/icon/Icon.svelte';
	import Box from '$lib/components/Box.svelte';
	import { type Snippet, onMount } from 'svelte';
	import posthog from 'posthog-js';
	import { browser } from '$app/environment';
	import { PUBLIC_POSTHOG_KEY } from '$env/static/public';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	onMount(() => {
		if (browser) {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: 'https://eu.i.posthog.com',
				person_profiles: 'identified_only',
				loaded: (ph) => {
					if (data.envName !== 'prod') {
						ph.opt_out_capturing();
						ph.set_config({ disable_session_recording: true });
					}
				}
			});
		}
		return;
	});

	let isNavigating = $state(false);
	const unsubscribe = navigating.subscribe(($navigating) => {
		if ($navigating) {
			isNavigating = true;
		} else {
			isNavigating = false;
		}
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
		class={`sticky top-0 z-20 flex items-center justify-between border-b p-3 backdrop-blur ${headerBackgroundClasses}`}
	>
		<div class="flex items-center">
			<a href="/" class="text-black">
				<Icon type={IconType.HOME} />
			</a>
		</div>

		<!-- Absolutely Centered Logo -->
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
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
	</header>

	<!-- Scrollable Content Block filling remaining space -->
	<main class="flex-1 overflow-y-auto p-2">
		<div class="mx-auto w-full px-1 pb-3 md:px-2 md:pb-0 md:pt-2 lg:px-4">
			{#if isNavigating}
				<Box>
					<ProgressBar></ProgressBar>
				</Box>
			{:else}
				{@render children?.()}
			{/if}
		</div>
	</main>
</div>
