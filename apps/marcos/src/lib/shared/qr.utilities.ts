import { QrOrigin, type QrInfo } from '@/type/qr.type';
import { validate as uuidValidate } from 'uuid';

export function generateQrString(info: QrInfo): string {
	return btoa(JSON.stringify(info));
}

export function parseQrString(qrString: string | undefined): QrInfo | undefined {
	if (qrString == null) {
		return undefined;
	}

	if (uuidValidate(qrString)) {
		return {
			orderId: qrString,
			origin: QrOrigin.LEGACY
		};
	}

	try {
		return JSON.parse(atob(qrString)) as QrInfo;
	} catch (e: unknown) {
		return undefined;
	}
}
