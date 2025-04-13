import { get, writable } from 'svelte/store';
import { PUBLIC_PROFILER_CONFIG } from '$env/static/public';
import { Profiler, type ProfilerConfig } from '@/shared/profiling/profiler';
import { DateTime } from 'luxon';
import { browser } from '$app/environment';

const profilerConfigKey = 'mmss-profiler-config';
const expirationTimeInMillis = 1000 * 60 * 60 * 24;
const globalProfiler = writable<Profiler | undefined>();

type ProfilerLocalStorage = {
	expiration: number;
	config: string;
};

export function getGlobalProfiler(): Profiler {
	const profiler = get(globalProfiler);
	if (profiler == null) {
		globalProfiler.set(new Profiler(getProfilerConfig()));
	}

	return get(globalProfiler)!;
}

export function getProfilerConfig(): ProfilerConfig {
	if (browser) {
		const profilerStoredConfig = localStorage.getItem(profilerConfigKey);
		if (profilerStoredConfig) {
			const storedData: ProfilerLocalStorage = JSON.parse(profilerStoredConfig);
			const isExpired = DateTime.now().toMillis() > storedData.expiration;
			if (!isExpired) {
				return Profiler.parseConfig(storedData.config);
			}
		}
	}

	return Profiler.parseConfig(PUBLIC_PROFILER_CONFIG);
}

export function updateProfilerConfig(newConfig: ProfilerConfig): void {
	if (browser) {
		const localStorageConfig: ProfilerLocalStorage = {
			expiration: DateTime.now().plus({ milliseconds: expirationTimeInMillis }).toMillis(),
			config: Profiler.encodeConfig(newConfig)
		};

		localStorage.setItem(profilerConfigKey, JSON.stringify(localStorageConfig));
		globalProfiler.set(new Profiler(newConfig));
	}
}
