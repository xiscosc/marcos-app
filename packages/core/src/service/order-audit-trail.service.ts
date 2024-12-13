import type { OrderAuditTrailEntryDto } from '../repository/dto/order-audit-trail-entry.dto';
import { OrderAuditTrailRepositoryDynamoDb } from '../repository/dynamodb/order-audit-trail.repository.dynamodb';
import { OrderService } from './order.service';
import { v4 as uuidv4 } from 'uuid';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import {
	Order,
	OrderAuditTrailDataEditEntry,
	OrderAuditTrailEntry,
	OrderAuditTrailType,
	OrderAuditTrailValue,
	OrderStatus
} from '../types/order.type';
import { DateTime } from 'luxon';

export class OrderAuditTrailService {
	private auditRepository: OrderAuditTrailRepositoryDynamoDb;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		this.auditRepository = new OrderAuditTrailRepositoryDynamoDb(config);
	}

	async logOrderStatusChanged(orderId: string, newStatus: OrderStatus, oldStatus?: OrderStatus) {
		await this.pushChanges(orderId, OrderAuditTrailType.STATUS, newStatus, oldStatus);
	}

	async logOrderLocationChanged(orderId: string, newLocation: string, oldLocation?: string) {
		await this.pushChanges(orderId, OrderAuditTrailType.LOCATION, newLocation, oldLocation);
	}

	async logOrderNotified(orderId: string) {
		await this.pushChanges(orderId, OrderAuditTrailType.NOTIFICATION, true, undefined);
	}

	async logOrderPayment(orderId: string, newAmount: number, oldAmount?: number) {
		await this.pushChanges(orderId, OrderAuditTrailType.PAYMENT, newAmount, oldAmount);
	}

	async logOrderFileCreated(orderId: string, fileId: string) {
		await this.pushChanges(orderId, OrderAuditTrailType.ATTACHMENT, fileId, '');
	}

	async getEntriesForDayWithoutDataType(date: Date): Promise<OrderAuditTrailEntry[]> {
		const startTs = DateTime.fromJSDate(date).startOf('day').toMillis();
		const endTs = DateTime.fromJSDate(date).endOf('day').toMillis();
		const dtos = await this.auditRepository.getOrderAuditTrailEntriesBetweenTs(startTs, endTs);
		const filteredDtos = dtos.filter((dto) => dto.type !== OrderAuditTrailType.DATA.toString());
		return filteredDtos.map((dto) => OrderAuditTrailService.fromDto(dto));
	}

	async logOrderFileDeleted(orderId: string, fileId: string) {
		await this.pushChanges(orderId, OrderAuditTrailType.ATTACHMENT, '', fileId);
	}

	async logOrderFullChanges(newOrder: Order, oldOrder: Order) {
		if (oldOrder.id !== newOrder.id) {
			return;
		}

		if (JSON.stringify(oldOrder) === JSON.stringify(newOrder)) {
			return;
		}

		await this.pushChanges(oldOrder.id, OrderAuditTrailType.DATA, newOrder, oldOrder);
	}

	private async pushChanges(
		orderId: string,
		type: OrderAuditTrailType,
		newValue: OrderAuditTrailValue | Order,
		oldValue: OrderAuditTrailValue | Order
	) {
		if (this.config.disableOrderAuditTrail === true) {
			return;
		}

		if (newValue === oldValue) {
			return;
		}

		const baseEntry = {
			id: uuidv4(),
			storeId: this.config.storeId,
			orderId,
			userName: this.config.user.name,
			userId: this.config.user.id,
			createdAt: DateTime.now().toJSDate()
		};

		if (type === OrderAuditTrailType.DATA) {
			const entry: OrderAuditTrailDataEditEntry = {
				newValue: newValue as Order,
				oldValue: oldValue as Order,
				type,
				...baseEntry
			};
			await this.auditRepository.createOrderAuditTrailEntry(
				OrderAuditTrailService.toDtoDataEdit(entry)
			);
		} else {
			const entry: OrderAuditTrailEntry = {
				newValue: newValue as OrderAuditTrailValue,
				oldValue: oldValue as OrderAuditTrailValue,
				type,
				...baseEntry
			};
			await this.auditRepository.createOrderAuditTrailEntry(OrderAuditTrailService.toDto(entry));
		}
	}

	private static fromDto(dto: OrderAuditTrailEntryDto): OrderAuditTrailEntry {
		return {
			storeId: dto.storeId,
			id: dto.uuid,
			type: dto.type as Exclude<OrderAuditTrailType, OrderAuditTrailType.DATA>,
			orderId: dto.orderUuid,
			userId: dto.userId,
			newValue: dto.newValue as OrderAuditTrailValue,
			oldValue: dto.oldValue as OrderAuditTrailValue,
			userName: dto.userName,
			createdAt: DateTime.fromMillis(dto.timestamp).toJSDate()
		};
	}

	private static toDto(entry: OrderAuditTrailEntry): OrderAuditTrailEntryDto {
		return {
			storeId: entry.storeId,
			uuid: entry.id,
			type: entry.type,
			orderUuid: entry.orderId,
			userId: entry.userId,
			userName: entry.userName,
			newValue: entry.newValue,
			oldValue: entry.oldValue,
			timestamp: DateTime.fromJSDate(entry.createdAt).toMillis()
		};
	}

	private static toDtoDataEdit(entry: OrderAuditTrailDataEditEntry): OrderAuditTrailEntryDto {
		return {
			storeId: entry.storeId,
			uuid: entry.id,
			type: entry.type,
			orderUuid: entry.orderId,
			userId: entry.userId,
			userName: entry.userName,
			newValue: OrderService.toDto(entry.newValue),
			oldValue: OrderService.toDto(entry.oldValue),
			timestamp: DateTime.fromJSDate(entry.createdAt).toMillis()
		};
	}
}
