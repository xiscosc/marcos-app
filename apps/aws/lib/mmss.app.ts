import { App, Tags } from 'aws-cdk-lib';
import { MmSsStack } from './mmss.stack.js';

export class MmSsApp extends App {
	constructor() {
		super();

		const props = {
			envName: MmSsApp.getFromEnv('CDK_ENV_NAME'),
			allowedUploadOrigins: MmSsApp.getFromEnv('ALLOWED_UPLOAD_ORIGINS').split(','),
			mainStoreId: MmSsApp.getFromEnv('MAIN_STORE_ID'),
			postHogKey: MmSsApp.getFromEnv('POSTHOG_KEY')
		};

		const stack = new MmSsStack(this, `${props.envName}-mmss-stack`, props);
		Tags.of(stack).add('project', `${props.envName}-mmss`);
	}

	private static getFromEnv(key: string): string {
		if (process.env[key] !== undefined) {
			return process.env[key]!;
		}

		throw Error(`Undefined env ${key}`);
	}
}
