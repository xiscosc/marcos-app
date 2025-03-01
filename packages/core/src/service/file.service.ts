import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import { FileRepositoryDynamoDb } from '../repository/dynamodb/file.repository.dynamodb';

import type { FileDto } from '../repository/dto/file.dto';
import { S3Util } from '../data/s3.util';
import { OrderAuditTrailService } from './order-audit-trail.service';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { getClientConfiguration } from '../configuration/configuration.util';
import { FileType, File } from '../types/file.type';
import { S3EventRecord } from 'aws-lambda';

interface IFileMetadata extends Record<string, string> {
	store_id: string;
	file_id: string;
	order_id: string;
	type: FileType;
}

export type OptmizationAndThumbnailTypeInfo = {
	optimizedContentType: string;
	thumbnailContentType: string;
	optimizedExtension: string;
	thumbnailExtension: string;
};

export class FileService {
	public static readonly optimizedImageSize = { width: 2160 };
	public static readonly optimizedImageQuality = { quality: 80 };
	public static readonly thumbnailImageSize = { width: 80, height: 80 };
	private repository: FileRepositoryDynamoDb;
	private orderAuditTrailServiceOrder: OrderAuditTrailService;
	private s3Client: S3Client;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		this.repository = new FileRepositoryDynamoDb(config);
		this.orderAuditTrailServiceOrder = new OrderAuditTrailService(config);
		this.s3Client = new S3Client(getClientConfiguration(config));

		if (this.config.filesBucket == null) {
			throw Error('files bucket is needed');
		}
	}

	public async createFile(orderId: string, fileName: string): Promise<File> {
		const mimeType = mime.lookup(fileName);
		if (mimeType === false) throw Error('Invalid filename');
		const id = uuidv4();
		const type = FileService.classifyMimeType(mimeType);
		const file: File = {
			orderId,
			id,
			type,
			originalFilename: fileName
		};
		const storageKey = FileService.generateStorageKey(file, fileName);
		const fileDto = FileService.toDto(file, storageKey);
		const metadata: IFileMetadata = {
			store_id: this.config.storeId,
			order_id: orderId,
			file_id: id,
			type
		};
		const uploadUrl = await S3Util.getPresignedUploadUrl(
			this.s3Client,
			this.config.filesBucket!,
			storageKey,
			mimeType,
			300,
			metadata
		);
		file.uploadUrl = uploadUrl;
		await Promise.all([
			this.repository.createFile(fileDto),
			this.orderAuditTrailServiceOrder.logOrderFileCreated(orderId, `${fileName} || ${id}`)
		]);
		return file;
	}

	public async storeOptimizations(
		orderId: string,
		id: string,
		optimizedImage: Buffer,
		thumbnailImage: Buffer,
		optimizationAndThumbnailTypeInfo?: OptmizationAndThumbnailTypeInfo
	) {
		const fileDto = await this.repository.getFile(orderId, id);
		if (fileDto == null) return;
		const file = FileService.fromDto(fileDto);

		if (file.type !== FileType.PHOTO) {
			return;
		}

		if (fileDto.optimizedKey != null && fileDto.thumbnailKey != null) {
			return;
		}

		const originalFile = await S3Util.getFileFromS3(
			this.s3Client,
			this.config.filesBucket!,
			fileDto.key
		);

		if (originalFile == null) {
			return;
		}

		if (fileDto.optimizedKey == null) {
			fileDto.optimizedKey = `optimized/${fileDto.key}${optimizationAndThumbnailTypeInfo?.optimizedExtension ?? ''}}`;
			await S3Util.uploadToS3(
				this.s3Client,
				this.config.filesBucket!,
				fileDto.optimizedKey,
				optimizedImage,
				optimizationAndThumbnailTypeInfo?.optimizedContentType ?? originalFile.contentType
			);
		}

		if (fileDto.thumbnailKey == null) {
			fileDto.thumbnailKey = `thumbnail/${fileDto.key}${optimizationAndThumbnailTypeInfo?.thumbnailExtension ?? ''}`;
			await S3Util.uploadToS3(
				this.s3Client,
				this.config.filesBucket!,
				fileDto.thumbnailKey,
				thumbnailImage,
				optimizationAndThumbnailTypeInfo?.thumbnailContentType ?? originalFile.contentType
			);
		}

		await this.repository.createFile(fileDto);

		if (fileDto.optimizedKey != null) {
			await S3Util.tagFilesForExpiry(this.s3Client, this.config.filesBucket!, [fileDto.key]);
		}
	}

	public async getFile(orderId: string, id: string): Promise<File | undefined> {
		const fileDto = await this.repository.getFile(orderId, id);
		if (fileDto == null) return undefined;
		return this.processFileToDownload(fileDto);
	}

	public async getPhotoFromS3EventRecord(
		record: S3EventRecord
	): Promise<{ content: Buffer; orderId: string; fileId: string } | undefined> {
		if (record.s3.bucket.name !== this.config.filesBucket) {
			throw Error('Incorrect bucket');
		}

		const metadata = (await S3Util.getObjectMetadata(
			this.s3Client,
			this.config.filesBucket,
			record.s3.object.key
		)) as IFileMetadata | undefined;

		if (
			metadata == null ||
			metadata.store_id !== this.config.storeId ||
			metadata.type !== FileType.PHOTO
		) {
			return undefined;
		}

		const result = await S3Util.getFileFromS3(
			this.s3Client,
			this.config.filesBucket!,
			record.s3.object.key
		);
		return result
			? {
					content: result.file,
					orderId: metadata.order_id,
					fileId: metadata.file_id
				}
			: undefined;
	}

	public async getFileContents(orderId: string, id: string): Promise<Buffer | undefined> {
		const fileDto = await this.repository.getFile(orderId, id);
		if (fileDto == null) return undefined;
		const result = await S3Util.getFileFromS3(this.s3Client, this.config.filesBucket!, fileDto.key);
		return result?.file;
	}

	public async getFilesByOrder(orderId: string): Promise<File[]> {
		const fileDtos = await this.repository.getFilesByOrder(orderId);
		const promises = fileDtos.map((dto) => this.processFileToDownload(dto));
		return await Promise.all(promises);
	}

	public async deleteFile(orderId: string, id: string) {
		const dto = await this.repository.getFile(orderId, id);
		if (dto == null) return;
		await Promise.all([
			this.repository.deleteFile(orderId, id),
			S3Util.tagFilesForExpiry(
				this.s3Client,
				this.config.filesBucket!,
				FileService.getAllFileKeys(dto)
			),
			this.orderAuditTrailServiceOrder.logOrderFileDeleted(
				orderId,
				`${dto.originalFilename} || ${dto.fileUuid}`
			)
		]);
	}

	private async processFileToDownload(fileDto: FileDto): Promise<File> {
		const downloadUrl = await S3Util.getPresignedDownloadUrl(
			this.s3Client,
			this.config.filesBucket!,
			fileDto.optimizedKey ?? fileDto.key,
			600
		);

		const thumbnailDownloadUrl = fileDto.thumbnailKey
			? await S3Util.getPresignedDownloadUrl(
					this.s3Client,
					this.config.filesBucket!,
					fileDto.thumbnailKey,
					600
				)
			: undefined;

		return FileService.fromDto(fileDto, downloadUrl, thumbnailDownloadUrl);
	}

	private static toDto(file: File, key: string): FileDto {
		return {
			orderUuid: file.orderId,
			fileUuid: file.id,
			type: file.type,
			originalFilename: file.originalFilename,
			key
		};
	}

	private static fromDto(
		fileDto: FileDto,
		downloadUrl?: string,
		thumbnailDownloadUrl?: string
	): File {
		return {
			orderId: fileDto.orderUuid,
			id: fileDto.fileUuid,
			type: fileDto.type as FileType,
			originalFilename: fileDto.originalFilename,
			downloadUrl,
			thumbnailDownloadUrl
		};
	}

	private static classifyMimeType(mimeType: string): FileType {
		if (mimeType.startsWith('image/')) {
			return FileType.PHOTO;
		} else if (mimeType.startsWith('video/')) {
			return FileType.VIDEO;
		} else {
			return FileType.OTHER;
		}
	}

	private static generateStorageKey(file: File, fileName: string) {
		const lastDotIndex = fileName.lastIndexOf('.');
		const extension =
			lastDotIndex === -1 || lastDotIndex === 0 ? '' : fileName.substring(lastDotIndex + 1);
		return `${file.orderId}/${file.type}/${file.id}.${extension.toLowerCase()}`;
	}

	private static getAllFileKeys(fileDto: FileDto): string[] {
		return [fileDto.key, fileDto.optimizedKey, fileDto.thumbnailKey].filter((key) => key != null);
	}
}
