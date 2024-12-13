import type { ItemDto } from './item.dto';

export type OrderDto = {
	uuid: string;
	shortId: string;
	customerUuid: string;
	timestamp: number;
	storeId: string;
	userId: string;
	userName: string;
	amountPayed: number;
	item: ItemDto;
	status: string;
	hasArrow?: boolean;
	location?: string;
	notified?: boolean;
};
