import { App } from 'aws-cdk-lib';
import { MmSsStack } from './mmss.stack.js';

export class MmSsApp extends App {
	constructor() {
		super();

		const props = {
			envName: MmSsApp.getFromEnv('CDK_ENV_NAME'),
			allowedUploadOrigins: MmSsApp.getFromEnv('ALLOWED_UPLOAD_ORIGINS').split(','),
			mainStoreId: MmSsApp.getFromEnv('MAIN_STORE_ID')
		};

		new MmSsStack(this, `${props.envName}-mmss-stack`, props);
	}

	private static getFromEnv(key: string): string {
		if (process.env[key] !== undefined) {
			return process.env[key]!;
		}

		throw Error(`Undefined env ${key}`);
	}
}
