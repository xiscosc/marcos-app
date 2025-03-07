import { Customer } from './customer.type';
import { PricingType } from './pricing.type';
import { StaticUser } from './user.type';

export type CalculatedItemPart = {
	priceId: string;
	price: number;
	discountAllowed: boolean;
	floating: boolean;
	quantity: number;
	description: string;
	log?: string;
};

export type CalculatedItemPartWithType = CalculatedItemPart & {
	type?: PricingType;
};

export type PreCalculatedItemPart = {
	type: PricingType;
	id: string;
	quantity: number;
	moldId?: string; // For fabric
	extraInfo?: string; // For extra pp info
};

export type PreCalculatedItemPartRequest = {
	partToCalculate: PreCalculatedItemPart;
	orderDimensions: OrderDimensions;
};

export type PPDimensions = {
	up: number;
	down: number;
	left: number;
	right: number;
};

export type Item = {
	width: number;
	height: number;
	floatingDistance: number;
	pp: number;
	ppDimensions?: PPDimensions;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	deliveryDate: Date;
	instantDelivery: boolean;
	partsToCalculate: PreCalculatedItemPart[];
	exteriorWidth?: number;
	exteriorHeight?: number;
	dimensionsType: DimensionsType;
};

export type CalculatedItem = {
	orderId: string;
	discount: number;
	parts: CalculatedItemPart[];
	quantity: number;
};

export type CalculatedItemWithPartTypes = CalculatedItem & {
	parts: CalculatedItemPartWithType[];
};

export type Order = {
	id: string;
	shortId: string;
	storeId: string;
	createdAt: Date;
	amountPayed: number;
	item: Item;
	status: OrderStatus;
	hasArrow: boolean;
	user: StaticUser;
	customer: Customer;
	location: string;
	notified: boolean;
	publicId: string;
};

export type ExternalOrder = {
	id: string;
	reference: string;
	storeId: string;
	createdAt: Date;
	item: Item;
	hasArrow: boolean;
	user: StaticUser;
	publicId: string;
};

export type OrderTotalsBase = {
	totalWithoutDiscount: number;
	total: number;
	unitPrice: number;
	unitPriceWithoutDiscount: number;
	discountNotAllowedPresent: boolean;
};

export type ExternalOrderTotals = OrderTotalsBase;

export type OrderTotals = OrderTotalsBase & {
	payed: boolean;
	remainingAmount: number;
};

export type FullOrder = {
	order: Order;
	calculatedItem: CalculatedItemWithPartTypes;
	totals: OrderTotals;
};

export type ExternalFullOrder = {
	order: ExternalOrder;
	calculatedItem: CalculatedItemWithPartTypes;
	totals: ExternalOrderTotals;
};

export enum OrderStatus {
	PENDING = 'pending',
	FINISHED = 'finished',
	DELETED = 'deleted',
	PICKED_UP = 'picked_up',
	QUOTE = 'quote'
}

export type OrderDimensions = {
	originalHeight: number;
	originalWidth: number;
	totalHeight: number;
	totalWidth: number;
	workingHeight: number;
	workingWidth: number;
};

export enum PaymentStatus {
	FULLY_PAID = 'fully_paid',
	PARTIALLY_PAID = 'partially_paid',
	UNPAID = 'unpaid'
}

export enum DimensionsType {
	NORMAL = 'normal',
	EXTERIOR = 'exterior',
	ROUNDED = 'rounded',
	WINDOW = 'window'
}

export enum OrderAuditTrailType {
	STATUS = 'status',
	ATTACHMENT = 'attachment',
	DATA = 'data',
	NOTIFICATION = 'notification',
	PAYMENT = 'payment',
	LOCATION = 'location'
}

type OrderAuditTrailEntryBase = {
	id: string;
	storeId: string;
	orderId: string;
	userId: string;
	userName: string;
	createdAt: Date;
};

export type OrderAuditTrailValue = string | number | OrderStatus | boolean | undefined;

export type OrderAuditTrailEntry = OrderAuditTrailEntryBase & {
	type: Exclude<OrderAuditTrailType, OrderAuditTrailType.DATA>;
	oldValue: OrderAuditTrailValue;
	newValue: OrderAuditTrailValue;
};

export type OrderAuditTrailDataEditEntry = OrderAuditTrailEntryBase & {
	type: OrderAuditTrailType.DATA;
	oldValue: Order;
	newValue: Order;
};
