import init, { profile_request } from './wasm/wasm_function';
import { PUBLIC_PROFILER_CONFIG } from '$env/static/public';

type ProfilerConfig = {
	enabled: boolean;
	loging: boolean;
	referencePoint: bigint;
	responseFactor: number;
	scopeLimit: number;
};

export class Profiler {
	private initialized = false;
	private config: ProfilerConfig;

	constructor() {
		this.config = this.parseConfig();
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

		await profile_request(
			this.config.referencePoint,
			this.config.loging,
			this.config.responseFactor,
			this.config.scopeLimit
		);
	}

	private parseConfig(): ProfilerConfig {
		const defaultConfig: ProfilerConfig = {
			enabled: false,
			loging: false,
			referencePoint: BigInt(0),
			responseFactor: 1,
			scopeLimit: 100
		};

		try {
			if (!PUBLIC_PROFILER_CONFIG) {
				return defaultConfig;
			}
			const decodedConfig = atob(PUBLIC_PROFILER_CONFIG);
			const parsedConfig = JSON.parse(decodedConfig);

			if (parsedConfig.referencePoint) {
				parsedConfig.referencePoint = BigInt(parsedConfig.referencePoint);
			}

			return parsedConfig;
		} catch (error) {
			console.error('Failed to parse profiler config:', error);
			return defaultConfig;
		}
	}
}
