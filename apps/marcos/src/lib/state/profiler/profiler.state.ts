import { browser } from '$app/environment';
import { PUBLIC_PROFILER_CONFIG } from '$env/static/public';
import { Profiler, type ProfilerConfig } from '@/shared/profiler/profiler';
import { DateTime } from 'luxon';
import { get, writable } from 'svelte/store';

const profilerConfigKey = 'mmss-profiler-config';
const expirationTimeInMillis = 1000 * 60 * 60 * 2;
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
		this.profiler = this.initProfiler(this.config);
	}

	public getProfiler(): Profiler {
		return this.profiler;
	}

	public getConfig(): ProfilerConfig {
		return this.config;
	}

	public updateDebugConfig(newConfig: ProfilerConfig): void {
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

	public clearDebugConfig(): void {
		if (browser) {
			localStorage.removeItem(profilerConfigKey);
			this.config = ProfilerState.getProfilerConfig();
			this.profiler.updateConfig(this.config);
		}
	}

	public static encodeConfig(config: ProfilerConfig): string {
		try {
			return btoa(JSON.stringify(config));
		} catch (error) {
			console.error('Failed to encode profiler config:', error);
			return btoa(JSON.stringify(this.defaultConfig));
		}
	}

	public static isDebugEnabled(): boolean {
		const profilerStoredConfig = localStorage.getItem(profilerConfigKey);
		if (profilerStoredConfig) {
			const storedData: ProfilerLocalStorage = JSON.parse(profilerStoredConfig);
			const isExpired = DateTime.now().toMillis() > storedData.expiration;
			if (!isExpired) {
				return true;
			} else {
				localStorage.removeItem(profilerConfigKey);
			}
		}
		return false;
	}

	private initProfiler(config: ProfilerConfig): Profiler {
		const profiler = get(globalProfiler);
		if (profiler == null) {
			const newProfiler = new Profiler(config);
			globalProfiler.set(newProfiler);
			return newProfiler;
		} else {
			profiler.updateConfig(config);
			return profiler;
		}
	}

	private static getProfilerConfig(): ProfilerConfig {
		if (browser) {
			const profilerStoredConfig = localStorage.getItem(profilerConfigKey);
			if (profilerStoredConfig) {
				const storedData: ProfilerLocalStorage = JSON.parse(profilerStoredConfig);
				const isExpired = DateTime.now().toMillis() > storedData.expiration;
				if (!isExpired) {
					return this.parseConfig(storedData.config);
				} else {
					localStorage.removeItem(profilerConfigKey);
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
	if (browser) {
		const state = new ProfilerState();
		return state.getProfiler();
	} else {
		return new Profiler(ProfilerState.defaultConfig);
	}
}
