import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import type { OrderDto } from '../dto/order.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import { orderTableBuilder, OrderSecondaryIndexNames } from './table/table.builders.dynamodb';
import {
	DynamoFilterElement,
	DynamoFilterExpression,
	DynamoQueryExpression,
	IDynamoPaginatedResult
} from '@balerial/dynamo/type';

export class OrderRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<OrderDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.orderTable == null) {
			throw Error('Table name orderTable can not be empty');
		}
		const defaultFilters: DynamoFilterElement[] = [
			{
				attribute: 'storeId',
				expression: DynamoFilterExpression.EQUAL,
				value: config.storeId
			},
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

	public async getOrderById(orderId: string): Promise<OrderDto | null> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: orderId
		});
		return dtos[0] ?? null;
	}

	public async getOrderByShortId(shortId: string): Promise<OrderDto | null> {
		const dtos = await this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.ShortId,
			partitionKeyValue: shortId
		});
		return dtos[0] ?? null;
	}

	public async getOrderByPublicId(publicId: string): Promise<OrderDto | null> {
		const dtos = await this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.PublicId,
			partitionKeyValue: publicId
		});
		return dtos[0] ?? null;
	}

	public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
		return this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.Customer,
			partitionKeyValue: customerUuid
		});
	}

	public async getOrdersByStatus(status: string): Promise<OrderDto[]> {
		return this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.Status,
			partitionKeyValue: status
		});
	}

	public async getOrdersByStatusPaginated(
		status: string,
		lastOrderPaginationKey?: Record<string, string | number>
	): Promise<IDynamoPaginatedResult<OrderDto>> {
		return this.repository.getByIndexPaginated({
			indexName: OrderSecondaryIndexNames.Status,
			partitionKeyValue: status,
			startKey: lastOrderPaginationKey
		});
	}

	public async findOrdersByStatus(status: string, query: string): Promise<OrderDto[]> {
		const filterAttributes: DynamoFilterElement[] = [
			{
				attribute: 'item.normalizedDescription',
				expression: DynamoFilterExpression.CONTAINS,
				value: query
			}
		];
		return this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.Status,
			partitionKeyValue: status,
			filters: filterAttributes
		});
	}

	public async getOrdersBetweenTs(
		customerUuid: string,
		startTs: number,
		endTs: number
	): Promise<OrderDto[]> {
		return this.repository.getByIndex({
			indexName: OrderSecondaryIndexNames.Customer,
			partitionKeyValue: customerUuid,
			sortQuery: {
				expression: DynamoQueryExpression.BETWEEN,
				value: { start: startTs, end: endTs }
			}
		});
	}

	public async createOrder(order: OrderDto) {
		if (order.storeId !== this.config.storeId) {
			return;
		}
		if (!order.uuid || !order.customerUuid || !order.timestamp || !order.storeId) {
			throw new Error('Invalid order data');
		}
		await this.repository.put(order);
	}

	public async setOrderNotified(order: OrderDto) {
		this.checkOrderStore(order);
		await this.repository.updateFields(
			order.uuid,
			new Map([['notified', order.notified ?? false]])
		);
	}

	public async setOrderStatus(order: OrderDto) {
		this.checkOrderStore(order);
		await this.repository.updateFields(
			order.uuid,
			new Map([
				['location', order.location ?? ''],
				['status', order.status]
			])
		);
	}

	public async updateAmountPayed(order: OrderDto) {
		this.checkOrderStore(order);
		await this.repository.updateFields(order.uuid, new Map([['amountPayed', order.amountPayed]]));
	}

	public async updateCustomerId(order: OrderDto) {
		this.checkOrderStore(order);
		await this.repository.updateFields(order.uuid, new Map([['customerUuid', order.customerUuid]]));
	}

	public async storeOrders(orders: OrderDto[]) {
		this.checkOrderStore(orders);
		await this.repository.batchPut(orders);
	}

	private checkOrderStore(dto: OrderDto | OrderDto[]) {
		if (Array.isArray(dto)) {
			dto.forEach((d) => {
				if (d.storeId !== this.config.storeId) {
					throw Error('Store id does not match');
				}
			});
		} else {
			if (dto.storeId !== this.config.storeId) {
				throw Error('Store id does not match');
			}
		}
	}
}
