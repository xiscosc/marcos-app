import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';

import type { ConfigDto, ConfigValue } from '../dto/config.dto';
import { configTableBuilder } from './table/table.builders.dynamodb';
import { getClientConfiguration } from '../../configuration/configuration.util';
import { DynamoQueryExpression } from '@balerial/dynamo/type';

export class ConfigRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<ConfigDto>;

	constructor(public readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.configTable == null) {
			throw Error('Table name configTable can not be empty');
		}

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			configTableBuilder.setTableName(config.configTable).build()
		);
	}

	async getConfigValue<T extends ConfigValue>(id: string): Promise<T | null> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: this.config.storeId,
			sortQuery: {
				expression: DynamoQueryExpression.EQUAL,
				value: id
			}
		});
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

		await this.repository.put(configDto);
	}
}
