import { OrderStatus } from '@marcsimolduressonsardina/core/type';
import { ButtonStyle } from '$lib/components/button/button.enum';
import { IconType } from '$lib/components/icon/icon.enum';

interface IUIInfo {
	colors: ButtonStyle;
	staticColor: string;
	colorName: string;
	gradientClasses: string;
	statusIcon: IconType;
}

const redGradientClasses = 'from-red-800 via-red-700 to-red-600';

export function getStatusUIInfo(status: OrderStatus, getVariant: boolean = false): IUIInfo {
	let colors = ButtonStyle.ORDER_GENERIC;
	let gradientClasses = '';
	let staticColor = '';
	let colorName = '';
	let statusIcon = IconType.ORDER_DEFAULT;
	switch (status) {
		case OrderStatus.PENDING:
			staticColor = 'bg-blue-700';
			colorName = 'blue';
			gradientClasses = 'from-blue-800 via-blue-700 to-blue-600';
			colors = getVariant ? ButtonStyle.ORDER_PENDING_VARIANT : ButtonStyle.ORDER_PENDING;
			statusIcon = IconType.ORDER_PENDING;
			break;
		case OrderStatus.FINISHED:
			staticColor = 'bg-amber-600';
			colorName = 'amber';
			gradientClasses = 'from-orange-600 via-orange-500 to-orange-400';
			colors = getVariant ? ButtonStyle.ORDER_FINISHED_VARIANT : ButtonStyle.ORDER_FINISHED;
			statusIcon = IconType.ORDER_FINISHED;
			break;
		case OrderStatus.PICKED_UP:
			staticColor = 'bg-green-700';
			colorName = 'green';
			gradientClasses = 'from-green-800 via-green-700 to-green-600';
			colors = getVariant ? ButtonStyle.ORDER_PICKED_UP_VARIANT : ButtonStyle.ORDER_PICKED_UP;
			statusIcon = IconType.ORDER_PICKED_UP;
			break;
		case OrderStatus.DELETED:
			break;
		case OrderStatus.QUOTE:
			staticColor = 'bg-purple-700';
			colorName = 'purple';
			gradientClasses = 'from-purple-800 via-purple-700 to-purple-600';
			colors = getVariant ? ButtonStyle.ORDER_QUOTE_VARIANT : ButtonStyle.ORDER_QUOTE;
			statusIcon = IconType.ORDER_QUOTE;
			break;
	}

	return { statusIcon, colors, gradientClasses, staticColor, colorName };
}

export function getStatusUIInfoWithPaymentInfo(
	status: OrderStatus,
	payed: boolean,
	getVariant: boolean = false
): IUIInfo {
	const uiInfo = getStatusUIInfo(status, getVariant);

	if ((status === OrderStatus.PICKED_UP && !payed) || (status === OrderStatus.FINISHED && payed)) {
		return {
			...uiInfo,
			colors: getVariant ? ButtonStyle.DELETE_VARIANT : ButtonStyle.DELETE,
			gradientClasses: redGradientClasses,
			staticColor: 'bg-red-600',
			colorName: 'red'
		};
	}

	return uiInfo;
}
