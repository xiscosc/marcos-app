import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const customerMoldIds = ['2_MARCO DEL CLIENTE', '1_SIN MARCO'];

export const discountMap: Record<string, number> = {
	'0': 0,
	'1': 10,
	'2': 15,
	'20': 20,
	'25': 25,
	'30': 30,
	'50': 50,
	'100': 100
};

export const orderStatusMap: Record<OrderStatus, string> = {
	[OrderStatus.FINISHED]: 'Finalizado',
	[OrderStatus.PICKED_UP]: 'Recogido',
	[OrderStatus.PENDING]: 'Pendiente',
	[OrderStatus.QUOTE]: 'Presupuesto',
	[OrderStatus.DELETED]: 'Eliminado'
};

export enum OrderActionNames {
	CREATE_ORDER = 'createOrder',
	CREATE_QUOTE = 'createQuote',
	EDIT_ORDER = 'editOrder',
	CREATE_EXTERNAL_ORDER = 'createExternalOrder'
}
