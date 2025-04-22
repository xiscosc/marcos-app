import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import type { FileDto } from '../dto/file.dto';
import { DynamoFilterElement, DynamoFilterExpression, DynamoRepository } from './dynamo.repository';
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
		const filters: DynamoFilterElement[] = [
			{
				attribute: 'type',
				expression: DynamoFilterExpression.EQUAL,
				value: 'photo'
			},
			{
				attribute: 'optimizedKey',
				expression: DynamoFilterExpression.ATTRIBUTE_EXISTS,
				value: true
			},
			{
				attribute: 'thumbnailKey',
				expression: DynamoFilterExpression.ATTRIBUTE_EXISTS,
				value: true
			}
		];

		const projections = ['key'];
		const dtos = await this.scan(filters, undefined, undefined, undefined, projections);
		return dtos.elements;
	}

	public async deleteFiles(files: FileDto[]) {
		const deleteInfo = files.map((f) => ({
			partitionKey: f.orderUuid,
			sortKey: f.fileUuid
		}));
		await this.batchDelete(deleteInfo);
	}
}
