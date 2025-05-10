import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

export const getLogger = (forCloudWatch: boolean = false): Logger => {
	if (forCloudWatch) {
		return pino();
	}
	return pino(
		{},
		pretty({
			colorize: true
		})
	);
};

export const getLoggerForLambda = (): Logger => getLogger(true);
