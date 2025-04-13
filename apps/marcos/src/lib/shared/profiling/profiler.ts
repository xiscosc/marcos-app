import init, { profile_request } from './wasm/wasm_function';
import { browser } from '$app/environment';
import { DateTime } from 'luxon';

export type ProfilerConfig = {
	enabled: boolean;
	loging: boolean;
	referencePoint: string;
	responseFactor: number;
	scopeLimit: number;
};

export class Profiler {
	private initialized = false;
	private config: ProfilerConfig;
	private referencePointBigInt: bigint;

	public static defaultConfig: ProfilerConfig = {
		enabled: false,
		loging: false,
		referencePoint: '2025-01-01',
		responseFactor: 3000,
		scopeLimit: 90
	};

	constructor(config: ProfilerConfig) {
		this.config = config;
		this.referencePointBigInt = BigInt(DateTime.fromISO(this.config.referencePoint).toMillis());

		if (this.config.enabled && this.config.loging) {
			console.log(
				'Profiler initialized with config:',
				JSON.stringify(this.config),
				this.referencePointBigInt
			);
		}
	}

	public async measure<T>(input: Promise<T>): Promise<T> {
		await this.runProfiler();
		return input;
	}

	public async measureStandalone(): Promise<void> {
		await this.runProfiler();
	}

	private async init(): Promise<void> {
		if (!this.initialized) {
			await init();
			this.initialized = true;
		}
	}

	private async runProfiler(): Promise<void> {
		if (!this.config.enabled) {
			return;
		}

		if (!this.initialized) {
			await this.init();
		}

		if (!this.initialized) {
			throw new Error('Profiler not initialized');
		}

		if (browser) {
			await profile_request(
				this.referencePointBigInt,
				this.config.loging,
				this.config.responseFactor,
				this.config.scopeLimit
			);
		}
	}

	public static parseConfig(configStr: string): ProfilerConfig {
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

	public static encodeConfig(config: ProfilerConfig): string {
		try {
			return btoa(JSON.stringify(config));
		} catch (error) {
			console.error('Failed to encode profiler config:', error);
			return btoa(JSON.stringify(this.defaultConfig));
		}
	}
}
