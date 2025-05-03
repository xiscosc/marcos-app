export enum QrOrigin {
	LEGACY = 'legacy',
	INTERNAL = 'internal',
	CUSTOMER = 'customer',
	CUSTOMER_V2 = 'customerV2'
}

export type QrInfo = {
	orderId: string;
	origin: QrOrigin;
};
