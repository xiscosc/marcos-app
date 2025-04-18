import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommandInput,
	PutObjectCommand,
	type S3Client,
	HeadObjectCommand,
	PutObjectTaggingCommand,
	Tag,
	StorageClass
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';
import { getLogger } from '../logger/logger';
import { Logger } from 'pino';

export class S3Util {
	public static async getPresignedUploadUrl(
		client: S3Client,
		bucket: string,
		key: string,
		mimeType: string,
		expire: number = 60,
		metadata?: Record<string, string>,
		intelligentTiering: boolean = false
	): Promise<string> {
		const params: PutObjectCommandInput = {
			Bucket: bucket,
			Key: key,
			ContentType: mimeType,
			Metadata: metadata,
			StorageClass: intelligentTiering ? StorageClass.INTELLIGENT_TIERING : undefined
		};

		return await getSignedUrl(client, new PutObjectCommand(params), {
			expiresIn: expire
		});
	}

	public static async getObjectMetadata(
		client: S3Client,
		bucket: string,
		key: string
	): Promise<Record<string, string> | undefined> {
		const headResult = await client.send(
			new HeadObjectCommand({
				Bucket: bucket,
				Key: key
			})
		);

		return headResult.Metadata;
	}

	public static async getPresignedDownloadUrl(
		client: S3Client,
		bucket: string,
		key: string,
		expire: number = 60
	): Promise<string> {
		const params = {
			Bucket: bucket,
			Key: key
		};

		return getSignedUrl(client, new GetObjectCommand(params), {
			expiresIn: expire
		});
	}

	public static async deleteFile(client: S3Client, bucket: string, key: string) {
		const deleteParams = {
			Bucket: bucket,
			Key: key
		};

		const command = new DeleteObjectCommand(deleteParams);
		await client.send(command);
	}

	public static async batchDeleteFiles(client: S3Client, bucket: string, keys: string[]) {
		const deleteParams = {
			Bucket: bucket,
			Delete: {
				Objects: keys.map((key) => ({ Key: key })),
				Quiet: true
			}
		};

		const deleteCommand = new DeleteObjectsCommand(deleteParams);
		client.send(deleteCommand);
	}

	public static async getFileFromS3(
		client: S3Client,
		bucket: string,
		key: string
	): Promise<{ file: Buffer; contentType?: string } | undefined> {
		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: key
		});

		try {
			const response = await client.send(command);
			return {
				file: await S3Util.streamToBuffer(response.Body as Readable),
				contentType: response.ContentType
			};
		} catch (error: unknown) {
			if (error instanceof Error) {
				if (error.name === 'NoSuchKey') {
					return undefined;
				}
			}

			throw new Error(`Failed to get file from S3: ${error}`);
		}
	}

	public static async uploadToS3(
		client: S3Client,
		bucket: string,
		key: string,
		body: Buffer,
		contentType?: string,
		intelligentTiering: boolean = false
	) {
		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
			StorageClass: intelligentTiering ? StorageClass.INTELLIGENT_TIERING : undefined
		});

		try {
			await client.send(command);
		} catch (error) {
			throw new Error(`Failed to upload file to S3: ${error}`);
		}
	}

	private static async streamToBuffer(stream: Readable): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Uint8Array[] = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	public static async tagFilesForExpiry(
		client: S3Client,
		bucket: string,
		keys: string[],
		pinoLogger?: Logger
	) {
		const logger = pinoLogger ?? getLogger();
		const tags: Tag[] = [
			{
				Key: 'expiry',
				Value: 'true'
			}
		];

		const tagPromises = keys.map((key) => S3Util.tagFile(logger, client, bucket, key, tags));
		const results = await Promise.allSettled(tagPromises);

		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				logger.error(`Failed to tag file ${keys[index]}: ${result.reason}`);
			}
		});
	}

	private static async tagFile(
		logger: Logger,
		client: S3Client,
		bucket: string,
		key: string,
		tags: Tag[]
	): Promise<void> {
		const command = new PutObjectTaggingCommand({
			Bucket: bucket,
			Key: key,
			Tagging: {
				TagSet: tags
			}
		});

		try {
			await client.send(command);
		} catch (error) {
			logger.error(`Failed to tag file ${key} with tags ${JSON.stringify(tags)}: ${error}`);
		}
	}
}
