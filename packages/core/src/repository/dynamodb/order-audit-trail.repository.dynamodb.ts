import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import type { OrderAuditTrailEntryDto } from '../dto/order-audit-trail-entry.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import {
	orderAuditTrailTableBuilder,
	OrderAuditTrailSecondaryIndexNames
} from './table/table.builders.dynamodb';
import { DynamoQueryExpression } from '@balerial/dynamo/type';

export class OrderAuditTrailRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<OrderAuditTrailEntryDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.orderAuditTrailTable == null) {
			throw Error('Table name orderAuditTrailTable can not be empty');
		}

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			orderAuditTrailTableBuilder.setTableName(config.orderAuditTrailTable).build()
		);
	}

	async createOrderAuditTrailEntry(dto: OrderAuditTrailEntryDto) {
		await this.repository.put(dto);
	}

	async getOrderAuditTrailEntriesForOrder(orderUuid: string): Promise<OrderAuditTrailEntryDto[]> {
		return this.repository.getByIndex({
			indexName: OrderAuditTrailSecondaryIndexNames.Order,
			partitionKeyValue: orderUuid
		});
	}

	async getOrderAuditTrailEntriesBetweenTs(
		startTs: number,
		endTs: number
	): Promise<OrderAuditTrailEntryDto[]> {
		return this.repository.getByIndex({
			indexName: OrderAuditTrailSecondaryIndexNames.Store,
			partitionKeyValue: this.config.storeId,
			sortQuery: {
				expression: DynamoQueryExpression.BETWEEN,
				value: { start: startTs, end: endTs }
			}
		});
	}
}
