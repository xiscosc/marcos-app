import pino, { Logger } from 'pino';
import pretty from 'pino-pretty';

export const getLogger = (): Logger => {
	return pino(
		{},
		pretty({
			colorize: true
		})
	);
};
