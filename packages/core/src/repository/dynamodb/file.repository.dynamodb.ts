import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import type { FileDto } from '../dto/file.dto';
import { DynamoRepository } from './dynamo.repository';
import { FileDynamoDbIndex } from './index.dynamodb';

export class FileRepositoryDynamoDb extends DynamoRepository<FileDto> {
	constructor(config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.fileTable == null) {
			throw Error('Table name fileTable can not be empty');
		}
		super(config, config.fileTable, FileDynamoDbIndex.primaryIndex);
	}

	public async createFile(file: FileDto) {
		await this.put(file);
	}

	public async getFile(orderUuid: string, fileUuid: string): Promise<FileDto | null> {
		const dtos = await this.getByIndex(this.primaryIndex, orderUuid, true, fileUuid);
		return dtos[0] ?? null;
	}

	public async getFilesByOrder(orderUuid: string): Promise<FileDto[]> {
		return await this.getByIndex(this.primaryIndex, orderUuid);
	}

	public async deleteFile(orderUuid: string, fileUuid: string) {
		await this.batchDelete([{ partitionKey: orderUuid, sortKey: fileUuid }]);
	}

	public async getOptimizedPhotoFileOriginalKeys(): Promise<Partial<FileDto>[]> {
		const filterExpression = '#n0 = :v0 AND attribute_exists(#n1) AND attribute_exists(#n2)';
		const projectionExpression = '#n3';

		const attributeNames = {
			'#n0': 'type',
			'#n1': 'optimizedKey',
			'#n2': 'thumbnailKey',
			'#n3': 'key'
		};

		const attributeValues = {
			':v0': 'photo'
		};

		const dtos = await this.scan(
			filterExpression,
			attributeNames,
			attributeValues,
			projectionExpression
		);

		return dtos;
	}

	public async deleteFiles(files: FileDto[]) {
		const deleteInfo = files.map((f) => ({
			partitionKey: f.orderUuid,
			sortKey: f.fileUuid
		}));
		await this.batchDelete(deleteInfo);
	}
}
