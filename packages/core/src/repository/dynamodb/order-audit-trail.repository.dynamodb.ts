import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';

import type { OrderAuditTrailEntryDto } from '../dto/order-audit-trail-entry.dto';
import { DynamoRepository } from './dynamo.repository';
import { OrderAuditTrailDynamoDbIndex } from './index.dynamodb';

export class OrderAuditTrailRepositoryDynamoDb extends DynamoRepository<OrderAuditTrailEntryDto> {
	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.orderAuditTrailTable == null) {
			throw Error('Table name orderAuditTrailTable can not be empty');
		}
		super(config, config.orderAuditTrailTable, OrderAuditTrailDynamoDbIndex.primaryIndex);
	}

	async createOrderAuditTrailEntry(dto: OrderAuditTrailEntryDto) {
		await this.put(dto);
	}

	async getOrderAuditTrailEntriesForOrder(orderUuid: string): Promise<OrderAuditTrailEntryDto[]> {
		return this.getByIndex(OrderAuditTrailDynamoDbIndex.orderIndex, orderUuid);
	}

	async getOrderAuditTrailEntriesBetweenTs(
		startTs: number,
		endTs: number
	): Promise<OrderAuditTrailEntryDto[]> {
		return this.getBySortingKeyBetween(
			OrderAuditTrailDynamoDbIndex.storeIndex,
			this.config.storeId,
			startTs,
			endTs
		);
	}
}
