import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import type { FileDto } from '../dto/file.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import { fileTableBuilder } from './table/table.builders.dynamodb';
import {
	DynamoFilterElement,
	DynamoFilterExpression,
	DynamoQueryExpression
} from '@balerial/dynamo/type';

export class FileRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<FileDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.fileTable == null) {
			throw Error('Table name fileTable can not be empty');
		}

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			fileTableBuilder.setTableName(config.fileTable).build()
		);
	}

	public async createFile(file: FileDto) {
		await this.repository.put(file);
	}

	public async getFile(orderUuid: string, fileUuid: string): Promise<FileDto | null> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: orderUuid,
			sortQuery: {
				expression: DynamoQueryExpression.EQUAL,
				value: fileUuid
			}
		});
		return dtos[0] ?? null;
	}

	public async getFilesByOrder(orderUuid: string): Promise<FileDto[]> {
		return await this.repository.getByIndex({
			partitionKeyValue: orderUuid
		});
	}

	public async deleteFile(orderUuid: string, fileUuid: string) {
		await this.repository.batchDelete([{ partitionKey: orderUuid, sortKey: fileUuid }]);
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
		const dtos = await this.repository.scan({
			filterAttributes: filters,
			projectionAttributes: projections
		});
		return dtos.elements;
	}

	public async deleteFiles(files: FileDto[]) {
		const deleteInfo = files.map((f) => ({
			partitionKey: f.orderUuid,
			sortKey: f.fileUuid
		}));
		await this.repository.batchDelete(deleteInfo);
	}
}
