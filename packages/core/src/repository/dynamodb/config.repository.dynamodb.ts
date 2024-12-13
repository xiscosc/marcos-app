import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';

import type { ConfigDto, ConfigValue } from '../dto/config.dto';
import { DynamoRepository } from './dynamo.repository';
import { ConfigDynamoDbIndex } from './index.dynamodb';

export class ConfigRepositoryDynamoDb extends DynamoRepository<ConfigDto> {
	constructor(public readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.configTable == null) {
			throw Error('Table name configTable can not be empty');
		}
		super(config, config.configTable, ConfigDynamoDbIndex.primaryIndex);
	}

	async getConfigValue<T extends ConfigValue>(id: string): Promise<T | null> {
		const dtos = await this.getByIndex(this.primaryIndex, this.config.storeId, true, id);
		const valueFromDb = dtos[0];
		if (valueFromDb != null) {
			return valueFromDb.value as T;
		}

		return null;
	}

	async storeConfigValue(configDto: ConfigDto) {
		if (configDto.storeId !== this.config.storeId) {
			return;
		}

		await this.put(configDto);
	}
}
