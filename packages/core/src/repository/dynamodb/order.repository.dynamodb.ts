import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';

import type { OrderDto } from '../dto/order.dto';
import { IPaginatedDtoResult } from '../dto/paginated-result.dto.interface';
import { DynamoFilterElement, DynamoFilterExpression, DynamoRepository } from './dynamo.repository';
import { OrderDynamoDbIndex } from './index.dynamodb';

export class OrderRepositoryDynamoDb extends DynamoRepository<OrderDto> {
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
		super(config, config.orderTable, OrderDynamoDbIndex.primaryIndex, defaultFilters);
	}

	public async getOrderById(orderId: string): Promise<OrderDto | null> {
		const dto = await this.getByIndex(this.primaryIndex, orderId);
		return dto[0];
	}

	public async getOrderByShortId(shortId: string): Promise<OrderDto | null> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.shortIdIndex, shortId);
		return dtos[0] ?? null;
	}

	public async getOrderByPublicId(publicId: string): Promise<OrderDto | null> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.publicIdIndex, publicId);
		return dtos[0] ?? null;
	}

	public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.customerIndex, customerUuid);
		return dtos;
	}

	public async getOrdersByStatus(status: string): Promise<OrderDto[]> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.statusIndex, status);
		return dtos;
	}

	public async getOrdersByStatusPaginated(
		status: string,
		lastOrderPaginationKey?: Record<string, string | number>
	): Promise<IPaginatedDtoResult<OrderDto>> {
		const paginationResult = await this.getByIndexPaginated(
			OrderDynamoDbIndex.statusIndex,
			status,
			lastOrderPaginationKey
		);
		return paginationResult;
	}

	public async findOrdersByStatus(status: string, query: string): Promise<OrderDto[]> {
		const filterAttributes: DynamoFilterElement[] = [
			{
				attribute: 'item.normalizedDescription',
				expression: DynamoFilterExpression.CONTAINS,
				value: query
			}
		];

		const dtos = await this.getByIndex(
			OrderDynamoDbIndex.statusIndex,
			status,
			false,
			undefined,
			undefined,
			filterAttributes
		);

		return dtos;
	}

	public async getOrdersBetweenTs(
		customerUuid: string,
		startTs: number,
		endTs: number
	): Promise<OrderDto[]> {
		const dtos = await this.getBySortingKeyBetween(
			OrderDynamoDbIndex.customerIndex,
			customerUuid,
			startTs,
			endTs
		);
		return dtos;
	}

	public async createOrder(order: OrderDto) {
		if (order.storeId !== this.config.storeId) {
			return;
		}

		if (!order.uuid || !order.customerUuid || !order.timestamp || !order.storeId) {
			throw new Error('Invalid order data');
		}

		await this.put(order);
	}

	public async setOrderNotified(order: OrderDto) {
		this.checkOrderStore(order);
		await this.updateFields(order.uuid, new Map([['notified', order.notified ?? false]]));
	}

	public async setOrderStatus(order: OrderDto) {
		this.checkOrderStore(order);
		await this.updateFields(
			order.uuid,
			new Map([
				['location', order.location ?? ''],
				['status', order.status]
			])
		);
	}

	public async updateAmountPayed(order: OrderDto) {
		this.checkOrderStore(order);
		await this.updateFields(order.uuid, new Map([['amountPayed', order.amountPayed]]));
	}

	public async updateCustomerId(order: OrderDto) {
		this.checkOrderStore(order);
		await this.updateFields(order.uuid, new Map([['customerUuid', order.customerUuid]]));
	}

	public async storeOrders(orders: OrderDto[]) {
		this.checkOrderStore(orders);
		await this.batchPut(orders);
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
