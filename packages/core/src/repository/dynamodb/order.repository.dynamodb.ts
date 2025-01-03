import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda,
	ICorePublicConfiguration,
	ICorePublicConfigurationForAWSLambda,
	PUBLIC_REPOSITORY
} from '../../configuration/core-configuration.interface';

import type { OrderDto } from '../dto/order.dto';
import { IPaginatedDtoResult } from '../dto/paginated-result.dto.interface';
import { DynamoRepository } from './dynamo.repository';
import { OrderDynamoDbIndex } from './index.dynamodb';

export class OrderRepositoryDynamoDb extends DynamoRepository<OrderDto> {
	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.orderTable == null) {
			throw Error('Table name orderTable can not be empty');
		}
		super(config, config.orderTable, OrderDynamoDbIndex.primaryIndex);
	}

	public async getOrderById(orderId: string): Promise<OrderDto | null> {
		const dto = await this.getByIndex(this.primaryIndex, orderId);
		return this.filterByStoreIdAndDeleted(dto[0]) as OrderDto | null;
	}

	public async getOrderByShortId(shortId: string): Promise<OrderDto | null> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.shortIdIndex, shortId);
		const dto = dtos[0] ?? null;
		return this.config.storeId === PUBLIC_REPOSITORY
			? dto
			: (this.filterByStoreIdAndDeleted(dto) as OrderDto | null);
	}

	public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.customerIndex, customerUuid);
		return this.filterByStoreIdAndDeleted(dtos) as OrderDto[];
	}

	public async getOrdersByStatus(status: string): Promise<OrderDto[]> {
		const dtos = await this.getByIndex(OrderDynamoDbIndex.statusIndex, status);
		return this.filterByStoreIdAndDeleted(dtos) as OrderDto[];
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
		const filteredDtos = this.filterByStoreIdAndDeleted(paginationResult.elements) as OrderDto[];
		return { ...paginationResult, elements: filteredDtos };
	}

	public async findOrdersByStatus(status: string, query: string): Promise<OrderDto[]> {
		const nestedAttributesMap = new Map([
			['#item', 'item'],
			['#description', 'normalizedDescription']
		]);

		const dtos = await this.searchInNestedFields(
			OrderDynamoDbIndex.statusIndex,
			status,
			query,
			nestedAttributesMap
		);
		return this.filterByStoreIdAndDeleted(dtos) as OrderDto[];
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
		return this.filterByStoreIdAndDeleted(dtos) as OrderDto[];
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

	public static createPublicRepository(
		publicConfig: ICorePublicConfiguration | ICorePublicConfigurationForAWSLambda
	): OrderRepositoryDynamoDb {
		return new OrderRepositoryDynamoDb(publicConfig);
	}

	private filterByStoreIdAndDeleted(
		dto: OrderDto | OrderDto[] | undefined | null
	): null | OrderDto | OrderDto[] {
		if (dto == null) {
			return null;
		}

		if (Array.isArray(dto)) {
			return dto.filter((d) => d.storeId === this.config.storeId && d.status !== 'deleted');
		}

		return dto.storeId === this.config.storeId && dto.status !== 'deleted' ? dto : null;
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
