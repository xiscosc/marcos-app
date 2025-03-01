import { PUBLIC_DOMAIN_URL } from '$env/static/public';

import {
	OrderStatus,
	PricingType,
	type CalculatedItem,
	type FullOrder,
	type Order
} from '@marcsimolduressonsardina/core/type';
import { CalculatedItemUtilities, otherExtraId } from '@marcsimolduressonsardina/core/util';
import { customerMoldIds, discountMap } from './mappings/order.mapping';

export class OrderUtilities {
	public static getOrderMolds(order: Order): string[] {
		return order.item.partsToCalculate
			.filter((p) => p.type === PricingType.MOLD)
			.map(
				(p) =>
					`${CalculatedItemUtilities.getMoldDescription(p.id)} ${p.quantity > 1 ? 'x' + p.quantity : ''}`
			);
	}

	public static getOrderElementByPricingType(
		order: Order,
		calculatedItem: CalculatedItem,
		pricingType: PricingType
	): string[] {
		const ids = order.item.partsToCalculate.filter((p) => p.type === pricingType).map((p) => p.id);

		return calculatedItem.parts
			.filter((p) => ids.indexOf(p.priceId) > -1)
			.map((p) => `${p.description} ${p.quantity > 1 ? 'x' + p.quantity : ''}`);
	}

	public static getExtras(calculatedItem: CalculatedItem): string[] {
		return calculatedItem.parts.filter((p) => p.priceId === otherExtraId).map((p) => p.description);
	}

	public static getWorkingDimensions(order: Order): string {
		const item = order.item;
		const { totalWidth, totalHeight } = CalculatedItemUtilities.getTotalDimensions(
			item.width,
			item.height,
			item.pp,
			item.ppDimensions
		);

		return `${OrderUtilities.formatNumber(totalHeight)}x${OrderUtilities.formatNumber(totalWidth)} cm`;
	}

	public static getFirstMoldDescriptionFromOrder(
		order: Order,
		calculatedItem: CalculatedItem
	): string | undefined {
		const ids = order.item.partsToCalculate
			.filter((p) => p.type === PricingType.MOLD)
			.filter((p) => !customerMoldIds.includes(p.id))
			.map((p) => p.id);

		if (ids.length === 0) {
			return undefined;
		}

		const molds = calculatedItem.parts
			.filter((p) => ids.indexOf(p.priceId) > -1)
			.map((p) => p.description);

		return molds.length === 0 ? undefined : molds[0];
	}

	public static getOrderPublicUrl(order: Order): string {
		return `${PUBLIC_DOMAIN_URL}/s/${order.shortId}`;
	}

	public static getWhatsappTicketText(order: Order): string {
		const url = OrderUtilities.getOrderPublicUrl(order);
		return `Su pedido \`\`\`${order.publicId}\`\`\` ha sido registrado correctamente, puede consultar aquí su resguardo ${url} . Marcs i Moldures Son Sardina.`;
	}

	public static getWhatsappQuoteText(order: Order): string {
		const url = OrderUtilities.getOrderPublicUrl(order);
		return `Aquí tiene una copia de su presupuesto \`\`\`${order.publicId}\`\`\` :  ${url} . Marcs i Moldures Son Sardina.`;
	}

	public static getWhatsappFinishedText(orders: Order[]): string {
		const greeting =
			'Nuestro horario es de lunes a viernes de 09:00 a 18:00 y los sábados de 09:30 a 13:15. Marcs i Moldures Son Sardina.';
		if (orders.length === 1) {
			const url = OrderUtilities.getOrderPublicUrl(orders[0]);
			return `Hemos terminado su pedido \`\`\`${orders[0].publicId}\`\`\` puede pasar a buscarlo. Aquí tiene el resguardo ${url} . ${greeting}`;
		} else {
			const orderLines = orders
				.map(
					(order) => `* \`\`\`${order.publicId}\`\`\` \n ${OrderUtilities.getOrderPublicUrl(order)}`
				)
				.join('\n');

			return `\n Hemos terminado sus pedidos:\n${orderLines}\nPuede pasar a buscarlos. ${greeting}`;
		}
	}

	public static getDiscountRepresentation(discount: number): string {
		const discountMapReverse: Record<number, string> = Object.entries(discountMap).reduce(
			(acc, [key, value]) => ({ ...acc, [value]: key }),
			{}
		);

		const discountKey = discountMapReverse[discount];
		if (discountKey) {
			return discountKey;
		}

		return `${discount}%`;
	}

	public static getPossibleNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
		switch (currentStatus) {
			case OrderStatus.PENDING:
				return [OrderStatus.FINISHED, OrderStatus.PICKED_UP];
			case OrderStatus.FINISHED:
				return [OrderStatus.PICKED_UP, OrderStatus.PENDING];
			case OrderStatus.PICKED_UP:
				return [OrderStatus.FINISHED, OrderStatus.PENDING];
			default:
				return [currentStatus];
		}
	}

	public static hydrateFullOrderDates(fullOrders: FullOrder[]): FullOrder[] {
		return fullOrders.map((fo) => ({
			...fo,
			order: {
				...fo.order,
				item: {
					...fo.order.item,
					deliveryDate: new Date(fo.order.item.deliveryDate)
				},
				createdAt: new Date(fo.order.createdAt)
			}
		}));
	}

	private static formatNumber(num: number): string | number {
		// Check if the number has decimals
		if (num % 1 !== 0) {
			// If it has decimals, format it to one decimal place
			return num.toFixed(1);
		}

		// If no decimals, return the number as it is
		return num;
	}
}
