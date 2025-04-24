import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { OrderDto } from '../dto/order.dto';
import { DynamoFilterElement, DynamoFilterExpression, DynamoRepository } from './dynamo.repository';
import { OrderDynamoDbIndex } from './index.dynamodb';

export class PublicOrderRepositoryDynamoDb extends DynamoRepository<OrderDto> {
	constructor(config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
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
		super(config, config.orderTable, OrderDynamoDbIndex.primaryIndex, defaultFilters);
	}

	public async getOrderByShortId(shortId: string): Promise<OrderDto | null> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.shortIdIndex, shortId);
		const dto = dtos[0] ?? null;
		return dto;
	}
}
