import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { OrderDto } from '../dto/order.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import { DynamoFilterElement, DynamoFilterExpression } from '@balerial/dynamo/type';
import { orderTableBuilder, OrderSecondaryIndexNames } from './table/table.builders.dynamodb';

export class PublicOrderRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<OrderDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.orderTable == null) {
			throw Error('Table name orderTable can not be empty');
		}

		const defaultFilters: DynamoFilterElement[] = [
			{
				attribute: 'status',
				expression: DynamoFilterExpression.NOT_EQUAL,
				value: 'deleted'
			}
		];

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			orderTableBuilder.setTableName(config.orderTable).setDefaultFilters(defaultFilters).build()
		);
	}

	public async getOrderByShortId(shortId: string): Promise<OrderDto | null> {
		const dtos = await this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.ShortId,
			partitionKeyValue: shortId
		});
		return dtos[0] ?? null;
	}
}
