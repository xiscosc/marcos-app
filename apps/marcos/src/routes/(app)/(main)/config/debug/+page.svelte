<script lang="ts">
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import type { PageData } from './$types';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Box from '@/components/generic/Box.svelte';
	import { Label } from '@/components/ui/label';
	import { Switch } from '@/components/ui/switch';
	import { getProfilerConfig, updateProfilerConfig } from '@/stores/profiler.store';
	import { browser } from '$app/environment';
	import { Input } from '@/components/ui/input';
	import { DateTime } from 'luxon';
	import { Profiler } from '@/shared/profiling/profiler';
	import { toast, Toaster } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	function bigIntToDate(dateInMilis: bigint): string {
		return DateTime.fromMillis(Number(dateInMilis)).toISODate() ?? DateTime.now().toISODate();
	}

	function dateToBigInt(date: string): bigint {
		return BigInt(DateTime.fromISO(date).toMillis());
	}

	let profilerEnabled = $state(false);
	let profilerLoging = $state(false);
	let profilerReferencePoint = $state(DateTime.now().toISODate());
	let profilerResponseFactor = $state(0);
	let profilerScopeLimit = $state(0);

	let profilerReferencePointInMillis = $derived(dateToBigInt(profilerReferencePoint));

	if (browser) {
		const currentProfilerConfig = getProfilerConfig();
		profilerEnabled = currentProfilerConfig.enabled;
		profilerLoging = currentProfilerConfig.loging;
		profilerReferencePoint = bigIntToDate(currentProfilerConfig.referencePoint);
		profilerResponseFactor = currentProfilerConfig.responseFactor;
		profilerScopeLimit = currentProfilerConfig.scopeLimit;
	}

	let debugConfig = $derived(
		profilerEnabled
			? {
					enabled: profilerEnabled,
					loging: profilerLoging,
					referencePoint: profilerReferencePointInMillis,
					responseFactor: profilerResponseFactor,
					scopeLimit: profilerScopeLimit
				}
			: { ...Profiler.defaultConfig, enabled: false }
	);

	let encodedConfig = $derived(Profiler.encodeConfig(debugConfig));

	$effect(() => {
		if (browser) {
			updateProfilerConfig(debugConfig);
			toast.success('Profiler updated');
		}
	});
</script>

<Toaster richColors />

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.SETTINGS}>Debug Settings</SimpleHeading>

	<Box title="Profiler">
		<div class="flex flex-col gap-2">
			<div
				class="shadow-xs flex h-10 flex-1 flex-row items-center justify-between gap-2 rounded-md border p-2"
			>
				<Label for="profilerEnabled">Enabled</Label>
				<Switch name="profilerEnabled" bind:checked={profilerEnabled} />
			</div>

			{#if profilerEnabled}
				<div
					class="shadow-xs flex h-10 flex-1 flex-row items-center justify-between gap-2 rounded-md border p-2"
				>
					<Label for="profilerLoging">Loging</Label>
					<Switch name="profilerLoging" bind:checked={profilerLoging} />
				</div>

				<div class="flex flex-col gap-2">
					<Label for="profilerReferencePoint">Reference Point:</Label>
					<Input name="profilerReferencePoint" type="date" bind:value={profilerReferencePoint} />
				</div>

				<div class="flex flex-col gap-2">
					<Label for="profilerResponseFactor">Response factor (ms):</Label>
					<Input
						type="number"
						step="1"
						min="0"
						name="profilerResponseFactor"
						bind:value={profilerResponseFactor}
					/>
				</div>

				<div class="flex flex-col gap-2">
					<Label for="profilerScopeLimit">Scope Limit (days):</Label>
					<Input
						type="number"
						step="1"
						min="0"
						name="profilerScopeLimit"
						bind:value={profilerScopeLimit}
					/>
				</div>
			{/if}

			<span class="text-md py-2">
				{encodedConfig}
			</span>
		</div>
	</Box>
</div>
