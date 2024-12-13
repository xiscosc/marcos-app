import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';

import type { CalculatedItemDto } from '../dto/calculated-item.dto';
import { DynamoRepository } from './dynamo.repository';
import { CalculatedItemDynamoDbIndex } from './index.dynamodb';

export class CalculatedItemRepositoryDynamoDb extends DynamoRepository<CalculatedItemDto> {
	constructor(config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.calculatedItemTable == null) {
			throw Error('Table name calculatedItemTable can not be empty');
		}
		super(config, config.calculatedItemTable, CalculatedItemDynamoDbIndex.primaryIndex);
	}

	public async getCalculatedItemById(orderUuid: string): Promise<CalculatedItemDto | null> {
		const dtos = await this.getByIndex(this.primaryIndex, orderUuid);
		return dtos[0] ?? null;
	}

	public async createCalculatedItem(calculatedItem: CalculatedItemDto) {
		await this.put(calculatedItem);
	}
}
