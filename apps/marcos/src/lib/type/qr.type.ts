export enum QrOrigin {
	LEGACY = 'legacy',
	INTERNAL = 'internal',
	CUSTOMER = 'customer'
}

export type QrInfo = {
	orderId: string;
	origin: QrOrigin;
};
