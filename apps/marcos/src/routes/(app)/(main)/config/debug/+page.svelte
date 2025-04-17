<script lang="ts">
	import SimpleHeading from '@/components/generic/SimpleHeading.svelte';
	import { IconType } from '@/components/generic/icon/icon.enum';
	import Box from '@/components/generic/Box.svelte';
	import { Label } from '@/components/ui/label';
	import { Switch } from '@/components/ui/switch';
	import { browser } from '$app/environment';
	import { Input } from '@/components/ui/input';
	import { DateTime } from 'luxon';
	import { Profiler, type ProfilerConfig } from '@/shared/profiler/profiler';
	import { toast, Toaster } from 'svelte-sonner';
	import Button from '@/components/generic/button/Button.svelte';
	import { ButtonStyle } from '@/components/generic/button/button.enum';
	import { ProfilerState } from '@/state/profiler/profiler.state';

	let profilerEnabled = $state(false);
	let profilerLoging = $state(false);
	let profilerReferencePoint = $state(DateTime.now().toISODate());
	let profilerResponseFactor = $state(0);
	let profilerScopeLimit = $state(0);
	let isDebugEnabled = $state(false);

	const profilerState = new ProfilerState();
	updateConfigState();

	let debugConfig: ProfilerConfig = $derived(
		profilerEnabled
			? {
					enabled: profilerEnabled,
					loging: profilerLoging,
					referencePoint: profilerReferencePoint,
					responseFactor: profilerResponseFactor,
					scopeLimit: profilerScopeLimit
				}
			: { ...ProfilerState.defaultConfig, enabled: false }
	);

	let encodedConfig = $derived(ProfilerState.encodeConfig(debugConfig));

	function updateConfigState() {
		if (browser) {
			const currentProfilerConfig = profilerState.getConfig();
			profilerEnabled = currentProfilerConfig.enabled;
			profilerLoging = currentProfilerConfig.loging;
			profilerReferencePoint = currentProfilerConfig.referencePoint;
			profilerResponseFactor = currentProfilerConfig.responseFactor;
			profilerScopeLimit = currentProfilerConfig.scopeLimit;
			isDebugEnabled = ProfilerState.isDebugEnabled();
		}
	}
</script>

<Toaster richColors />

<div class="flex flex-col gap-4">
	<SimpleHeading icon={IconType.SETTINGS}>Debug Settings</SimpleHeading>

	<Box title="Profiler" icon={isDebugEnabled ? IconType.DONE : IconType.CLOSE}>
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

			<div
				class="shadow-xs hiden h-10 flex-1 flex-row items-center justify-between gap-2 rounded-md border p-2 lg:flex"
			>
				<span class="text-md break-words"> {encodedConfig}</span>
			</div>

			<div class="flex">
				<Button
					text="Update debug config"
					icon={IconType.ORDER_PENDING}
					style={ButtonStyle.FORM}
					onClick={() => {
						if (browser) {
							profilerState.updateDebugConfig(debugConfig);
							toast.success('Profiler updated for 2h');
							isDebugEnabled = ProfilerState.isDebugEnabled();
						}
					}}
				></Button>
			</div>

			<div class="flex">
				<Button
					text="Delete debug config"
					icon={IconType.TRASH}
					style={ButtonStyle.DELETE}
					onClick={() => {
						if (browser) {
							profilerState.clearDebugConfig();
							updateConfigState();
							toast.success('Restored config to default');
						}
					}}
				></Button>
			</div>
		</div>
	</Box>
</div>
