import { get, writable } from 'svelte/store';
import { PUBLIC_PROFILER_CONFIG } from '$env/static/public';
import { Profiler, type ProfilerConfig } from '@/shared/profiling/profiler';

const profilerConfig = writable(Profiler.parseConfig(PUBLIC_PROFILER_CONFIG));
const globalProfiler = writable<Profiler | undefined>();

export function getGlobalProfiler(): Profiler {
	const profiler = get(globalProfiler);
	if (profiler == null) {
		globalProfiler.set(new Profiler(getProfilerConfig()));
	}

	return get(globalProfiler)!;
}

export function getProfilerConfig(): ProfilerConfig {
	return get(profilerConfig);
}

export function updateProfilerConfig(newConfig: ProfilerConfig): void {
	profilerConfig.set(newConfig);
	globalProfiler.set(new Profiler(newConfig));
}
