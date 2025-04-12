import { Customer } from '../../types/customer.type';
import {
	CalculatedItemPart,
	DimensionsType,
	PPDimensions,
	PreCalculatedItemPart
} from '../../types/order.type';

export type OrderCreationDtoBase = {
	width: number;
	height: number;
	pp: number;
	floatingDistance: number;
	description: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	deliveryDate: Date;
	partsToCalculate: PreCalculatedItemPart[];
	extraParts: CalculatedItemPart[];
	discount: number;
	hasArrow: boolean;
	ppDimensions?: PPDimensions;
	exteriorWidth?: number;
	exteriorHeight?: number;
	instantDelivery: boolean;
	dimensionsType: DimensionsType;
};

type MainOrderCreationDto = OrderCreationDtoBase & { isQuote: boolean };

export type ExternalOrderCreationDto = OrderCreationDtoBase & {
	markup: number;
};

export type OrderCreationDto = MainOrderCreationDto & { customerId?: string };
export type OrderCreationWithCustomerDto = MainOrderCreationDto & {
	customer: Customer;
};
