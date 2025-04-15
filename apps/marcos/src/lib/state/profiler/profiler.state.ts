import { browser } from '$app/environment';
import { PUBLIC_PROFILER_CONFIG } from '$env/static/public';
import { Profiler, type ProfilerConfig } from '@/shared/profiler/profiler';
import { DateTime } from 'luxon';
import { get, writable } from 'svelte/store';

const profilerConfigKey = 'mmss-profiler-config';
const expirationTimeInMillis = 1000 * 60 * 60 * 24;
const globalProfiler = writable<Profiler | undefined>();

type ProfilerLocalStorage = {
	expiration: number;
	config: string;
};

export class ProfilerState {
	public static defaultConfig: ProfilerConfig = {
		enabled: false,
		loging: false,
		referencePoint: '2025-01-01',
		responseFactor: 3000,
		scopeLimit: 90
	};
	private profiler: Profiler;
	private config: ProfilerConfig;

	constructor() {
		this.config = ProfilerState.getProfilerConfig();
		this.profiler = this.initProfiler();
		this.updateConfig(this.config);
	}

	public getProfiler(): Profiler {
		return this.profiler;
	}

	public getConfig(): ProfilerConfig {
		return this.config;
	}

	public updateConfig(newConfig: ProfilerConfig): void {
		if (browser) {
			const localStorageConfig: ProfilerLocalStorage = {
				expiration: DateTime.now().plus({ milliseconds: expirationTimeInMillis }).toMillis(),
				config: ProfilerState.encodeConfig(newConfig)
			};

			localStorage.setItem(profilerConfigKey, JSON.stringify(localStorageConfig));
			this.profiler.updateConfig(newConfig);
		}
		this.config = newConfig;
	}

	public static encodeConfig(config: ProfilerConfig): string {
		try {
			return btoa(JSON.stringify(config));
		} catch (error) {
			console.error('Failed to encode profiler config:', error);
			return btoa(JSON.stringify(this.defaultConfig));
		}
	}

	private initProfiler(): Profiler {
		const profiler = get(globalProfiler);
		if (profiler == null) {
			const newProfiler = new Profiler(ProfilerState.defaultConfig);
			globalProfiler.set(newProfiler);
			return newProfiler;
		}

		return profiler;
	}

	private static getProfilerConfig(): ProfilerConfig {
		if (browser) {
			const profilerStoredConfig = localStorage.getItem(profilerConfigKey);
			if (profilerStoredConfig) {
				const storedData: ProfilerLocalStorage = JSON.parse(profilerStoredConfig);
				const isExpired = DateTime.now().toMillis() > storedData.expiration;
				if (!isExpired) {
					return this.parseConfig(storedData.config);
				}
			}
		}

		return this.parseConfig(PUBLIC_PROFILER_CONFIG);
	}

	private static parseConfig(configStr: string): ProfilerConfig {
		try {
			if (!configStr) {
				return this.defaultConfig;
			}
			const decodedConfig = atob(configStr);
			return JSON.parse(decodedConfig);
		} catch (error) {
			console.error('Failed to parse profiler config:', error);
			return this.defaultConfig;
		}
	}
}

export function getGlobalProfiler(): Profiler {
	const state = new ProfilerState();
	return state.getProfiler();
}
