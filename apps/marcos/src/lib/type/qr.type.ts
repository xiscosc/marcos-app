export enum QrOrigin {
	LEGACY = 'legacy',
	INTERNAL = 'INTERNAL',
	CUSTOMER = 'CUSTOMER'
}

export type QrInfo = {
	orderId: string;
	origin: QrOrigin;
};
