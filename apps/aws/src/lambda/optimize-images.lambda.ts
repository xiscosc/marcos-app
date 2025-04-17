import { S3CreateEvent } from 'aws-lambda';
import 'dotenv/config';
import { lambdaOptimizeImages } from '@marcsimolduressonsardina/lambda/images';
import { getLogger } from '@marcsimolduressonsardina/core/logger';

export async function handler(event: S3CreateEvent): Promise<void> {
	const logger = getLogger();
	try {
		await lambdaOptimizeImages(
			event.Records,
			process.env.STORE_ID,
			process.env.FILES_BUCKET,
			process.env.FILE_TABLE
		);
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`Error optimize images: ${err.toString()}`);
		} else {
			logger.error(`Error optimize images: ${String(err)}`);
		}
	}
}
