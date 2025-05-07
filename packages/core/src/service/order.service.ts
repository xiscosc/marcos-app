import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { CustomerService } from './customer.service';
import type { OrderDto } from '../repository/dto/order.dto';
import { OrderRepositoryDynamoDb } from '../repository/dynamodb/order.repository.dynamodb';
import { CalculatedItemService } from './calculated-item.service';
import type { ItemDto } from '../repository/dto/item.dto';
import { InvalidDataError } from '../error/invalid-data.error';
import type {
	ExternalOrderCreationDto,
	OrderCreationWithCustomerDto
} from './dto/order-creation.dto';
import type { OrderCreationDto } from './dto/order-creation.dto';
import { DateTime } from 'luxon';
import { OrderAuditTrailService } from './order-audit-trail.service';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda,
	ICorePublicConfiguration,
	ICorePublicConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import {
	CalculatedItem,
	CalculatedItemWithPartTypes,
	DimensionsType,
	ExternalFullOrder,
	ExternalOrder,
	ExternalOrderTotals,
	FullOrder,
	Item,
	Order,
	OrderStatus,
	OrderTotals,
	OrderTotalsBase,
	PreCalculatedItemPart
} from '../types/order.type';
import { SearchUtilities } from '../utilities/search.utilities';
import { Customer } from '../types/customer.type';
import { CalculatedItemUtilities } from '../utilities/calculated-item.utilites';
import { PricingType } from '../types/pricing.type';
import { UserService } from './user.service';
import { tempCustomerUuid, OrderUtilities, quoteDeliveryDate } from '../utilities/order.utilities';
import { StaticUser } from '../types';
import { PricingService } from './pricing.service';

export interface ISameDayOrderCounters {
	finishedCount: number;
	pendingCount: number;
	totalCount: number;
}

interface PaginatedOrders {
	orders: FullOrder[];
	nextKey?: Record<string, string | number>;
}

export class OrderService {
	private repository: OrderRepositoryDynamoDb;
	private customerService: CustomerService;
	private orderAuditTrailService: OrderAuditTrailService;
	private calculatedItemService: CalculatedItemService;
	private pricingService: PricingService;

	constructor(
		private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda,
		customerService?: CustomerService,
		orderAuditTrailService?: OrderAuditTrailService,
		pricingService?: PricingService
	) {
		this.repository = new OrderRepositoryDynamoDb(config);
		this.customerService = customerService ?? new CustomerService(config);
		this.orderAuditTrailService = orderAuditTrailService ?? new OrderAuditTrailService(config);
		this.pricingService = pricingService ?? new PricingService(config);
		this.calculatedItemService = new CalculatedItemService(config, this.pricingService);
	}

	async getOrderById(orderId: string): Promise<Order | null> {
		const orderDto = await this.repository.getOrderById(orderId);
		if (orderDto) {
			const customer =
				orderDto.customerUuid === tempCustomerUuid
					? OrderService.getTempCustomer(this.config.storeId)
					: await this.customerService.getCustomerById(orderDto.customerUuid);
			return OrderService.fromDto(
				orderDto,
				customer ?? OrderService.getTempCustomer(this.config.storeId)
			);
		}

		return null;
	}

	async getFullOrderById(orderId: string): Promise<FullOrder | null> {
		const order = await this.getOrderById(orderId);
		if (order != null) {
			return (await this.getFullOrders([order]))[0];
		}

		return null;
	}

	async getOrderIdByPublicId(publicId: string): Promise<string | null> {
		const order = await this.repository.getOrderByPublicId(publicId);
		return order?.uuid ?? null;
	}

	async getOrdersByStatus(status: OrderStatus): Promise<FullOrder[]> {
		const orders = await this.getStandaloneOrdersByStatus(status);
		return this.getFullOrders(orders);
	}

	async getStandaloneOrdersByStatus(status: OrderStatus): Promise<Order[]> {
		const orderDtos = await this.repository.getOrdersByStatus(status);
		const customerIds = orderDtos.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		customerMap.set(tempCustomerUuid, OrderService.getTempCustomer(this.config.storeId));
		const orders = orderDtos.map((o) =>
			OrderService.fromDto(
				o,
				customerMap.get(o.customerUuid) ?? OrderService.getTempCustomer(this.config.storeId)
			)
		);

		return orders;
	}

	async getOrdersByStatusPaginated(
		status: OrderStatus,
		nextKey?: Record<string, string | number>
	): Promise<PaginatedOrders> {
		const paginatedDtoResult = await this.repository.getOrdersByStatusPaginated(status, nextKey);
		const customerIds = paginatedDtoResult.elements.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		customerMap.set(tempCustomerUuid, OrderService.getTempCustomer(this.config.storeId));
		const orders = paginatedDtoResult.elements.map((o) =>
			OrderService.fromDto(
				o,
				customerMap.get(o.customerUuid) ?? OrderService.getTempCustomer(this.config.storeId)
			)
		);
		const fullOrders = await this.getFullOrders(orders);
		return { orders: fullOrders, nextKey: paginatedDtoResult.endKey };
	}

	async findOrdersByStatus(status: OrderStatus, query: string): Promise<FullOrder[]> {
		const orderDtos = await this.repository.findOrdersByStatus(
			status,
			SearchUtilities.normalizeString(query)
		);
		const customerIds = orderDtos.map((dto) => dto.customerUuid);
		const customerMap = await this.customerService.getAllCustomersMap(customerIds);
		customerMap.set(tempCustomerUuid, OrderService.getTempCustomer(this.config.storeId));
		const orders = orderDtos.map((o) =>
			OrderService.fromDto(
				o,
				customerMap.get(o.customerUuid) ?? OrderService.getTempCustomer(this.config.storeId)
			)
		);
		return this.getFullOrders(orders);
	}

	async getOrdersByCustomerId(customerId: string): Promise<FullOrder[]> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return [];

		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		const orders = this.processDtosFromRepository(orderDtos, customer).filter(
			(o) => o.status !== OrderStatus.QUOTE
		);

		return this.getFullOrders(orders);
	}

	async getOrdersByCustomerIdAndStatus(
		customerId: string,
		status: OrderStatus
	): Promise<FullOrder[]> {
		const customer = await this.customerService.getCustomerById(customerId);
		if (customer === null) return [];

		const orderDtos = await this.repository.getOrdersByCustomerId(customerId);
		const orders = this.processDtosFromRepository(orderDtos, customer).filter(
			(o) => o.status === status
		);
		return this.getFullOrders(orders);
	}

	async getOrdersCountOnSameDay(order: Order): Promise<ISameDayOrderCounters> {
		const dtos = await this.getSameDayOrdersDtos(order);
		const orderDtos = dtos.filter((dto) => dto.status !== OrderStatus.QUOTE.toString());
		const finishedCount = orderDtos.filter(
			(dto) => dto.status === OrderStatus.FINISHED.toString()
		).length;
		const pendingCount = orderDtos.filter(
			(dto) => dto.status === OrderStatus.PENDING.toString()
		).length;
		return { pendingCount, finishedCount, totalCount: orderDtos.length };
	}

	async getOrdersOnSameDay(order: Order): Promise<FullOrder[]> {
		const orderDtos = await this.getSameDayOrdersDtos(order);
		const orders = this.processDtosFromRepository(orderDtos, order.customer).filter(
			(o) => o.status !== OrderStatus.QUOTE
		);
		return this.getFullOrders(orders);
	}

	async createOrderFromDto(dto: OrderCreationDto): Promise<FullOrder | null> {
		const customer =
			dto.customerId == null
				? OrderService.getTempCustomer(this.config.storeId)
				: await this.customerService.getCustomerById(dto.customerId);

		if (customer === null) return null;
		return this.createOrder({
			...dto,
			customer
		});
	}

	async createExternalOrderFromDto(dto: ExternalOrderCreationDto): Promise<ExternalFullOrder> {
		const { order, calculatedItem } = await this.generateExternalOrderAndCalculatedItemFromDto(dto);
		const totals = this.getTotalsForExternalOrder(calculatedItem, dto.markup);
		order.reference = OrderService.generateReferenceForExternalOrder(totals);
		return {
			order,
			calculatedItem,
			totals
		};
	}

	async updateOrderFromDto(orderId: string, dto: OrderCreationDto): Promise<Order | null> {
		if (dto.customerId == null) {
			throw Error('Customer is required');
		}

		const customer = await this.customerService.getCustomerById(dto.customerId);
		if (customer == null) {
			throw Error('Customer is required');
		}

		const order = await this.getOrderById(orderId);
		if (order == null) {
			throw Error('Order not found');
		}

		return this.updateOrder(order, {
			...dto,
			customer
		});
	}

	async addCustomerToTemporaryOrder(customer: Customer, order: Order): Promise<Order> {
		if (!OrderUtilities.isOrderTemp(order)) {
			throw Error('Order is not temporary');
		}
		order.customer = customer;
		const newDto = OrderService.toDto(order);
		await this.repository.updateCustomerId(newDto);
		return order;
	}

	async moveQuoteToOrder(order: Order, deliveryDate: Date): Promise<Order> {
		if (order.status !== OrderStatus.QUOTE) return order;
		order.createdAt = DateTime.now().toJSDate();
		order.item.deliveryDate = deliveryDate;
		order.status = OrderStatus.PENDING;
		const newDto = OrderService.toDto(order);
		await Promise.all([
			this.repository.createOrder(newDto),
			this.orderAuditTrailService.logOrderStatusChanged(
				order.id,
				OrderStatus.PENDING,
				OrderStatus.QUOTE
			)
		]);
		return order;
	}

	async moveOrderToQuote(order: Order): Promise<Order> {
		if (order.status === OrderStatus.QUOTE) return order;
		const oldStatus = order.status;
		order.createdAt = DateTime.now().toJSDate();
		order.item.deliveryDate = quoteDeliveryDate;
		order.status = OrderStatus.QUOTE;
		order.notified = false;
		order.amountPayed = 0;
		const newDto = OrderService.toDto(order);
		await Promise.all([
			this.repository.createOrder(newDto),
			this.orderAuditTrailService.logOrderStatusChanged(order.id, OrderStatus.QUOTE, oldStatus)
		]);
		return order;
	}

	async setOrderFullyPaid(order: Order) {
		const oldAmount = order.amountPayed;
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		const total = OrderService.getTotalsForOrder(order, calculatedItem).total;
		order.amountPayed = total;
		await Promise.all([
			this.repository.updateAmountPayed(OrderService.toDto(order)),
			this.orderAuditTrailService.logOrderPayment(order.id, order.amountPayed, oldAmount)
		]);
	}

	async setOrderPartiallyPaid(order: Order, amount: number) {
		const oldAmount = order.amountPayed;
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return;
		const total = OrderService.getTotalsForOrder(order, calculatedItem).total;
		if (amount < 0) {
			throw new InvalidDataError('Invalid amount');
		}

		if (amount > total) {
			order.amountPayed = total;
		} else {
			order.amountPayed = amount;
		}

		await Promise.all([
			this.repository.updateAmountPayed(OrderService.toDto(order)),
			this.orderAuditTrailService.logOrderPayment(order.id, order.amountPayed, oldAmount)
		]);
	}

	async setOrderStatus(order: Order, status: OrderStatus, location?: string) {
		const oldStatus = order.status;
		const oldLocation = order.location;
		order.status = status;
		order.location = location ?? '';
		await Promise.all([
			this.repository.setOrderStatus(OrderService.toDto(order)),
			this.orderAuditTrailService.logOrderStatusChanged(order.id, status, oldStatus),
			this.orderAuditTrailService.logOrderLocationChanged(order.id, order.location, oldLocation)
		]);
	}

	async setOrderAsNotified(order: Order) {
		order.notified = true;
		await Promise.all([
			this.repository.setOrderNotified(OrderService.toDto(order)),
			this.orderAuditTrailService.logOrderNotified(order.id)
		]);
	}

	static async getPublicOrder(
		config: ICorePublicConfiguration | ICorePublicConfigurationForAWSLambda,
		publicId: string
	): Promise<FullOrder | null> {
		const repo = OrderRepositoryDynamoDb.createPublicRepository(config);
		const orderDto = await repo.getOrderByShortId(publicId);
		if (orderDto) {
			const publicCustomer = await CustomerService.getPublicCustomerForPublicOrder(
				orderDto,
				config
			);
			if (publicCustomer == null) return null;
			const order = OrderService.fromDto(orderDto, publicCustomer);
			const publicCalculatedItemService = new CalculatedItemService(
				config,
				new PricingService(config)
			);
			const calculatedItem = await publicCalculatedItemService.getCalculatedItem(order.id);
			if (calculatedItem == null) return null;
			return {
				order,
				calculatedItem,
				totals: OrderService.getTotalsForOrder(order, calculatedItem)
			};
		}

		return null;
	}

	static validateOrderId(orderId?: string): boolean {
		return uuidValidate(orderId);
	}

	private static getTempCustomer(storeId: string): Customer {
		return {
			id: tempCustomerUuid,
			name: 'Temp',
			storeId,
			phone: '+34612345678'
		};
	}

	private processDtosFromRepository(orderDtos: OrderDto[], customer: Customer): Order[] {
		if (orderDtos.length > 0) {
			const orders = orderDtos.map((dto) => OrderService.fromDto(dto, customer));
			return orders.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		}

		return [];
	}

	private async getSameDayOrdersDtos(order: Order): Promise<OrderDto[]> {
		const firstSecond = new Date(order.createdAt);
		firstSecond.setHours(0, 0, 0, 0);
		const startTs = firstSecond.getTime();

		const lastSecond = new Date(order.createdAt);
		lastSecond.setHours(23, 59, 59, 999);
		const endTs = lastSecond.getTime();

		return this.repository.getOrdersBetweenTs(order.customer.id, startTs, endTs);
	}

	private async createOrder(dto: OrderCreationWithCustomerDto): Promise<FullOrder> {
		const { order, calculatedItem } = await this.generateOrderAndCalculatedItemFromDto(dto);
		await Promise.all([
			this.repository.createOrder(OrderService.toDto(order)),
			this.calculatedItemService.saveCalculatedItem(calculatedItem),
			this.orderAuditTrailService.logOrderStatusChanged(order.id, order.status)
		]);
		return {
			calculatedItem: OrderService.addTypesToCalculatedItem(order, calculatedItem),
			order,
			totals: OrderService.getTotalsForOrder(order, calculatedItem)
		};
	}

	private async getFullOrders(orders: Order[]): Promise<FullOrder[]> {
		const orderMap = new Map(orders.map((order) => [order.id, order]));
		const calculatedItemsPromises = orders.map((order) =>
			this.calculatedItemService.getCalculatedItem(order.id)
		);
		const calculatedItems = (await Promise.all(calculatedItemsPromises)).filter(
			(calculatedItem) => calculatedItem != null
		);
		return calculatedItems.map((calculatedItem) => ({
			calculatedItem: OrderService.addTypesToCalculatedItem(
				orderMap.get(calculatedItem.orderId)!,
				calculatedItem
			),
			order: orderMap.get(calculatedItem.orderId)!,
			totals: OrderService.getTotalsForOrder(orderMap.get(calculatedItem.orderId)!, calculatedItem)
		}));
	}

	private async updateOrder(
		originalOrder: Order,
		dto: OrderCreationWithCustomerDto
	): Promise<Order> {
		const { order, calculatedItem } = await this.generateOrderAndCalculatedItemFromDto(
			dto,
			originalOrder.id,
			originalOrder.shortId,
			originalOrder.createdAt,
			originalOrder.status,
			originalOrder.location,
			originalOrder.amountPayed,
			originalOrder.notified,
			originalOrder.user,
			originalOrder.publicId
		);

		await Promise.all([
			this.repository.createOrder(OrderService.toDto(order)),
			this.calculatedItemService.saveCalculatedItem(calculatedItem),
			this.orderAuditTrailService.logOrderFullChanges(order, originalOrder)
		]);
		return order;
	}

	private async generateExternalOrderAndCalculatedItemFromDto(
		dto: ExternalOrderCreationDto
	): Promise<{ order: ExternalOrder; calculatedItem: CalculatedItem }> {
		const createdAt = DateTime.now().toJSDate();
		const order: ExternalOrder = {
			id: uuidv4(),
			publicId: await this.generateExternalPublicId(createdAt),
			reference: '',
			createdAt,
			storeId: this.config.storeId,
			user: this.config.user,
			hasArrow: dto.hasArrow,
			item: {
				width: dto.width,
				height: dto.height,
				pp: dto.pp,
				floatingDistance: dto.floatingDistance,
				ppDimensions: dto.ppDimensions,
				description: dto.description,
				predefinedObservations: dto.predefinedObservations,
				observations: dto.observations,
				quantity: dto.quantity,
				deliveryDate: dto.deliveryDate,
				dimensionsType: dto.dimensionsType,
				partsToCalculate: OrderService.optimizePartsToCalculate(dto.partsToCalculate),
				exteriorWidth: dto.exteriorWidth,
				exteriorHeight: dto.exteriorHeight,
				instantDelivery: dto.instantDelivery
			}
		};

		OrderService.verifyItem(order.item);
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			order,
			dto.discount,
			dto.extraParts
		);
		return { order, calculatedItem };
	}

	private async generateExternalPublicId(createdAt: Date): Promise<string> {
		const { customAlphabet } = await import('nanoid');
		const middle = customAlphabet('ABCDEFGHIJKLMNPQRSTUVWXYZ123456789', 4)();
		const dateStr = DateTime.fromJSDate(createdAt).toFormat('ddMMyyyy');
		return `${dateStr}/${middle}/EXTERNO`.toUpperCase();
	}

	private async generateOrderAndCalculatedItemFromDto(
		dto: OrderCreationWithCustomerDto,
		originalId?: string,
		originalShortId?: string,
		originalCreationDate?: Date,
		originalOrderStatus?: OrderStatus,
		originalLocation?: string,
		originalAmountPayed?: number,
		originalNotified?: boolean,
		originalUser?: StaticUser,
		originalPublicId?: string
	): Promise<{ order: Order; calculatedItem: CalculatedItem }> {
		const order: Order = {
			id: originalId ?? uuidv4(),
			shortId: originalShortId ?? '',
			publicId: originalPublicId ?? '',
			customer: dto.customer,
			createdAt: originalCreationDate ?? new Date(),
			storeId: this.config.storeId,
			user: originalUser ?? this.config.user,
			amountPayed: originalAmountPayed ?? 0,
			status: originalOrderStatus ?? (dto.isQuote ? OrderStatus.QUOTE : OrderStatus.PENDING),
			hasArrow: dto.hasArrow,
			notified: originalNotified ?? false,
			location: originalLocation ?? '',
			item: {
				width: dto.width,
				height: dto.height,
				pp: dto.pp,
				floatingDistance: dto.floatingDistance,
				ppDimensions: dto.ppDimensions,
				description: dto.description,
				predefinedObservations: dto.predefinedObservations,
				observations: dto.observations,
				quantity: dto.quantity,
				deliveryDate: dto.deliveryDate,
				dimensionsType: dto.dimensionsType,
				partsToCalculate: OrderService.optimizePartsToCalculate(dto.partsToCalculate),
				exteriorWidth: dto.exteriorWidth,
				exteriorHeight: dto.exteriorHeight,
				instantDelivery: dto.instantDelivery
			}
		};

		if (order.shortId === '') {
			order.shortId = await OrderService.generateShortId();
		}

		if (order.publicId === '') {
			order.publicId = await OrderService.generatePublicId(order.createdAt, order.customer);
		}

		OrderService.verifyItem(order.item);
		const calculatedItem = await this.calculatedItemService.createCalculatedItem(
			order,
			dto.discount,
			dto.extraParts
		);
		return { order, calculatedItem };
	}

	private getTotalsForExternalOrder(
		calculatedItem: CalculatedItem,
		markup: number
	): ExternalOrderTotals {
		const totalsBase = OrderService.getTotals(calculatedItem);
		return {
			...totalsBase,
			markup,
			totalWithoutMarkup: this.pricingService.calculatePriceWithoutMarkup(totalsBase.total)
		};
	}

	private static generateReferenceForExternalOrder(totals: ExternalOrderTotals): string {
		const totalStr = totals.total.toFixed(2).replace('.', '');
		const totalWithoutMarkupStr = totals.totalWithoutMarkup.toFixed(2).replace('.', '');
		return `${totalStr}/${totals.markup}/${totalWithoutMarkupStr}`;
	}

	private static optimizePartsToCalculate(parts: PreCalculatedItemPart[]): PreCalculatedItemPart[] {
		const map = new Map<string, PreCalculatedItemPart>();
		parts.forEach((p) => {
			const id = `${p.type}_${p.id}_${p.moldId ?? ''}_${p.extraInfo ?? ''}`;
			if (map.has(id)) {
				const existingPart = map.get(id)!;
				p.quantity += existingPart.quantity;
			}

			map.set(id, p);
		});

		return Array.from(map.values());
	}

	private static async generateShortId(): Promise<string> {
		const { nanoid } = await import('nanoid');
		return nanoid(10);
	}

	private static verifyItem(item: Item) {
		if (!item.quantity) {
			throw new InvalidDataError('Invalid item data');
		}

		for (const part of item.partsToCalculate) {
			if (!part.id || !part.quantity || !part.type) {
				throw new InvalidDataError('Invalid item data');
			}
		}
	}

	public static toDto(order: Order): OrderDto {
		return {
			uuid: order.id!,
			shortId: order.shortId,
			customerUuid: order.customer.id,
			timestamp: Date.parse(order.createdAt.toISOString()),
			storeId: order.storeId!,
			userId: order.user.id,
			userName: order.user.name,
			amountPayed: order.amountPayed,
			item: OrderService.toDtoItem(order.item),
			status: order.status,
			hasArrow: order.hasArrow,
			location: order.location,
			notified: order.notified,
			publicId: order.publicId
		};
	}

	private static fromDto(dto: OrderDto, customer: Customer): Order {
		return {
			id: dto.uuid,
			shortId: dto.shortId,
			customer,
			createdAt: new Date(dto.timestamp),
			storeId: dto.storeId,
			user: UserService.generateStaticUser(dto.userId, dto.userName, dto.storeId),
			amountPayed: dto.amountPayed,
			item: OrderService.fromDtoItem(dto.item),
			status: dto.status as OrderStatus,
			hasArrow: dto.hasArrow ?? false,
			location: dto.location ?? '',
			notified: dto.notified ?? false,
			publicId: dto.publicId
		};
	}

	private static toDtoItem(item: Item): ItemDto {
		return {
			width: item.width,
			height: item.height,
			pp: item.pp,
			ppDimensions: item.ppDimensions,
			description: item.description,
			floatingDistance: item.floatingDistance,
			normalizedDescription: SearchUtilities.normalizeString(item.description),
			predefinedObservations: item.predefinedObservations,
			observations: item.observations,
			quantity: item.quantity,
			deliveryDate: Date.parse(item.deliveryDate.toISOString()),
			partsToCalculate: item.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as string,
				moldId: part.moldId,
				extraInfo: part.extraInfo
			})),
			exteriorHeight: item.exteriorHeight,
			exteriorWidth: item.exteriorWidth,
			instantDelivery: item.instantDelivery,
			dimensionsType: item.dimensionsType
		};
	}

	private static fromDtoItem(dto: ItemDto): Item {
		return {
			width: dto.width,
			height: dto.height,
			pp: dto.pp,
			floatingDistance: dto.floatingDistance ?? 0,
			ppDimensions: dto.ppDimensions,
			description: dto.description,
			predefinedObservations: dto.predefinedObservations,
			observations: dto.observations,
			quantity: dto.quantity,
			deliveryDate: new Date(dto.deliveryDate),
			partsToCalculate: dto.partsToCalculate.map((part) => ({
				id: part.id,
				quantity: part.quantity,
				type: part.type as PricingType,
				moldId: part.moldId,
				extraInfo: part.extraInfo
			})),
			exteriorHeight: dto.exteriorHeight,
			exteriorWidth: dto.exteriorWidth,
			instantDelivery: dto.instantDelivery ?? false,
			dimensionsType: dto.dimensionsType
				? (dto.dimensionsType as DimensionsType)
				: dto.exteriorHeight != null || dto.exteriorWidth != null
					? DimensionsType.EXTERIOR
					: DimensionsType.NORMAL
		};
	}

	private static async generatePublicId(createdAt: Date, customer: Customer): Promise<string> {
		const { customAlphabet } = await import('nanoid');
		const middle = customAlphabet('ABCDEFGHIJKLMNPQRSTUVWXYZ123456789', 2)();
		const dateStr = DateTime.fromJSDate(createdAt).toFormat('ddMMyyyy');
		const phoneWithoutPlus = customer.phone.replace('+', '');
		return `${dateStr}/${middle}/${phoneWithoutPlus}`;
	}

	private static addTypesToCalculatedItem(
		order: Order,
		calculatedItem: CalculatedItem
	): CalculatedItemWithPartTypes {
		const parts = calculatedItem.parts;
		const preparts = order.item.partsToCalculate;

		// Create a map of PreCalculatedItemPart based on id for quick lookup
		const prepartsMap = new Map<string, PreCalculatedItemPart>(
			preparts.map((prepart) => [prepart.id, prepart])
		);

		// Map through the parts and match them with corresponding preparts using the priceId and id
		const partsWithTypes = parts.map((part) => {
			const matchingPrepart = prepartsMap.get(part.priceId);

			return {
				...part,
				type: matchingPrepart?.type // If a matching prepart exists, set the type, otherwise undefined
			};
		});

		return {
			...calculatedItem,
			parts: partsWithTypes
		};
	}

	private static getTotals(calculatedItem: CalculatedItem): OrderTotalsBase | ExternalOrderTotals {
		const unitPrice = CalculatedItemUtilities.calculatePartsCost(
			calculatedItem.parts,
			true,
			calculatedItem.discount
		);

		const unitPriceWithoutDiscount = CalculatedItemUtilities.calculatePartsCost(
			calculatedItem.parts,
			false
		);

		const total = unitPrice * calculatedItem.quantity;

		return {
			unitPrice: unitPrice,
			unitPriceWithoutDiscount: unitPriceWithoutDiscount,
			totalWithoutDiscount: unitPriceWithoutDiscount * calculatedItem.quantity,
			total,
			discountNotAllowedPresent:
				calculatedItem.parts.some((part) => !part.discountAllowed) && calculatedItem.discount > 0
		};
	}

	private static getTotalsForOrder(order: Order, calculatedItem: CalculatedItem): OrderTotals {
		const totalsBase = OrderService.getTotals(calculatedItem);
		const remainingAmount = totalsBase.total - order.amountPayed;

		return {
			...totalsBase,
			payed: remainingAmount <= 0,
			remainingAmount
		};
	}
}
