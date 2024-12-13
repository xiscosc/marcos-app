import type { OrderDto } from './order.dto';

export type OrderAuditTrailEntryDto = {
	uuid: string;
	orderUuid: string;
	userId: string;
	userName: string;
	storeId: string;
	type: string;
	oldValue?: string | boolean | number | OrderDto;
	newValue?: string | boolean | number | OrderDto;
	timestamp: number;
};
