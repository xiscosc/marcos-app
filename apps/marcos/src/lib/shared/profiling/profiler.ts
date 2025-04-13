import init, { profile_request } from './wasm/wasm_function';
import { browser } from '$app/environment';

export type ProfilerConfig = {
	enabled: boolean;
	loging: boolean;
	referencePoint: bigint;
	responseFactor: number;
	scopeLimit: number;
};

export class Profiler {
	private initialized = false;
	private config: ProfilerConfig;
	public static defaultConfig: ProfilerConfig = {
		enabled: false,
		loging: true,
		referencePoint: BigInt(1745964000000),
		responseFactor: 3000,
		scopeLimit: 90
	};

	constructor(config: ProfilerConfig) {
		this.config = config;
		if (this.config.loging) {
			console.log(
				'Profiler initialized with config:',
				JSON.stringify({ ...this.config, referencePoint: Number(this.config.referencePoint) })
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
				this.config.referencePoint,
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
			const parsedConfig = JSON.parse(decodedConfig);

			if (parsedConfig.referencePoint) {
				parsedConfig.referencePoint = BigInt(parsedConfig.referencePoint);
			}

			return parsedConfig;
		} catch (error) {
			console.error('Failed to parse profiler config:', error);
			return this.defaultConfig;
		}
	}

	public static encodeConfig(config: ProfilerConfig): string {
		try {
			const transformedConfig = { ...config, referencePoint: Number(config.referencePoint) };
			const configStr = JSON.stringify(transformedConfig);
			return btoa(configStr);
		} catch (error) {
			console.error('Failed to encode profiler config:', error);
			const transformedConfig = {
				...this.defaultConfig,
				referencePoint: Number(this.defaultConfig.referencePoint)
			};
			const configStr = JSON.stringify(transformedConfig);
			return btoa(configStr);
		}
	}
}
