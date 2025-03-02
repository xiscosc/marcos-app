import { ICoreConfigurationForAWSLambda } from '@marcsimolduressonsardina/core/config';
import {
	FileService,
	OptmizationAndThumbnailTypeInfo
} from '@marcsimolduressonsardina/core/service';
import { AppUser } from '@marcsimolduressonsardina/core/type';
import { S3EventRecord } from 'aws-lambda';
import sharp from 'sharp';

export async function lambdaOptimizeImages(
	s3Records: S3EventRecord[],
	storeId?: string,
	filesBucketName?: string,
	filesTableName?: string
) {
	const user: AppUser = {
		id: 'automation@lambda.aws',
		storeId: storeId ?? '',
		name: 'AWS LAMBDA',
		priceManager: true,
		priceMarkUp: 0
	};
	const configuration: ICoreConfigurationForAWSLambda = {
		runInAWSLambda: true,
		storeId: user.storeId,
		filesBucket: filesBucketName,
		fileTable: filesTableName,
		orderAuditTrailTable: 'not-used',
		user
	};
	const fileService = new FileService(configuration);
	const promises = s3Records.map((record) => processImage(record, fileService));
	await Promise.all(promises);
}

async function processImage(record: S3EventRecord, fileService: FileService) {
	const originalImageData = await fileService.getPhotoFromS3EventRecord(record);

	if (originalImageData == null) {
		return;
	}

	const optimizedImage = await sharp(originalImageData.content)
		.resize(FileService.optimizedImageSize)
		.webp(FileService.optimizedImageQuality)
		.toBuffer();
	const thumbnail = await sharp(originalImageData.content)
		.resize(FileService.thumbnailImageSize)
		.webp()
		.toBuffer();

	const types: OptmizationAndThumbnailTypeInfo = {
		optimizedContentType: 'image/webp',
		thumbnailContentType: 'image/webp',
		optimizedExtension: '.webp',
		thumbnailExtension: '.webp'
	};

	await fileService.storeOptimizations(
		originalImageData.orderId,
		originalImageData.fileId,
		optimizedImage,
		thumbnail,
		types
	);
}
