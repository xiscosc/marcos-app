import { S3CreateEvent } from 'aws-lambda';
import 'dotenv/config';
import { lambdaOptimizeImages } from '@marcsimolduressonsardina/lambda/images';
import { getLogger } from '@marcsimolduressonsardina/core/logger';

export async function handler(event: S3CreateEvent): Promise<void> {
	const logger = getLogger();
	const input = {
		s3Records: event.Records,
		envName: process.env.ENV_NAME ?? 'env-not-set',
		storeId: process.env.STORE_ID,
		filesBucketName: process.env.FILES_BUCKET,
		filesTableName: process.env.FILE_TABLE,
		postHogKey: process.env.POSTHOG_KEY
	};
	try {
		await lambdaOptimizeImages(input);
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`Error optimize images: ${err.toString()}`);
		} else {
			logger.error(`Error optimize images: ${String(err)}`);
		}
	}
}
