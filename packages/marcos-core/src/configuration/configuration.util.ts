import { ICoreConfiguration, ICoreConfigurationForAWSLambda } from './core-configuration.interface';

export function getClientConfiguration(
	config: ICoreConfiguration | ICoreConfigurationForAWSLambda
) {
	return config.runInAWSLambda
		? {}
		: {
				region: config.region,
				credentials: config.credentials
			};
}
