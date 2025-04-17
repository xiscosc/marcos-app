import pino, { Logger } from 'pino';

export const getLogger = (): Logger => {
	return pino({
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname'
			}
		}
	});
};
