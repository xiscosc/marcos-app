import init, { profile_request } from './wasm/wasm_function';
import { PUBLIC_PROFILER_TARGET, PUBLIC_MEASURE_PROFILE } from '$env/static/public';

export class Profiler {
	private initialized = false;
	private enabled: boolean;

	constructor() {
		this.enabled = PUBLIC_MEASURE_PROFILE === 'yes';
	}

	private async init(): Promise<void> {
		if (!this.initialized) {
			await init();
			this.initialized = true;
		}
	}

	public async measure<T>(input: Promise<T>): Promise<T> {
		if (!this.enabled) {
			return input;
		}

		if (!this.initialized) {
			await this.init();
		}

		if (!this.initialized) {
			throw new Error('Profiler not initialized');
		}

		await profile_request(BigInt(PUBLIC_PROFILER_TARGET), true);
		return input;
	}

	public async measureStandalone(): Promise<void> {
		if (!this.enabled) {
			return;
		}

		if (!this.initialized) {
			await this.init();
		}

		if (!this.initialized) {
			throw new Error('Profiler not initialized');
		}

		await profile_request(BigInt(PUBLIC_PROFILER_TARGET), true);
	}
}
