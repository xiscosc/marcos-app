import {
	CalculatedItem,
	CalculatedItemPart,
	OrderDimensions,
	PPDimensions
} from '../types/order.type';
import { PricingType } from '../types/pricing.type';

export const cornersId = 'cantoneras_extra';
export const otherExtraId = 'other_extra';

export class CalculatedItemUtilities {
	public static getOrderDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): OrderDimensions {
		const { totalWidth, totalHeight } = CalculatedItemUtilities.getTotalDimensions(
			width,
			height,
			pp,
			ppDimensions
		);

		const workingWidth = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalWidth);
		const workingHeight = CalculatedItemUtilities.roundUpToNearestGreaterFiveOrTen(totalHeight);
		return {
			workingWidth,
			workingHeight,
			totalHeight,
			totalWidth,
			originalHeight: height,
			originalWidth: width
		};
	}

	public static sortByPricingType(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		arr: any[],
		path: (string | number)[] = ['type']
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): any[] {
		const desiredOrder: PricingType[] = [
			PricingType.PP,
			PricingType.MOLD,
			PricingType.GLASS,
			PricingType.BACK,
			PricingType.FABRIC,
			PricingType.LABOUR,
			PricingType.HANGER,
			PricingType.OTHER,
			PricingType.TRANSPORT
		];

		return arr.sort((a, b) => {
			const aValue = CalculatedItemUtilities.getValueByPath(a, path);
			const bValue = CalculatedItemUtilities.getValueByPath(b, path);

			// Handle undefined types by placing them after TRANSPORT
			const aIndex = aValue !== undefined ? desiredOrder.indexOf(aValue) : desiredOrder.length;
			const bIndex = bValue !== undefined ? desiredOrder.indexOf(bValue) : desiredOrder.length;

			return aIndex - bIndex;
		});
	}

	public static getTotalDimensions(
		width: number,
		height: number,
		pp: number,
		ppDimensions?: PPDimensions
	): { totalWidth: number; totalHeight: number } {
		if (ppDimensions !== undefined) {
			const totalWidth = width + ppDimensions.left + ppDimensions.right;
			const totalHeight = height + ppDimensions.up + ppDimensions.down;
			return { totalWidth, totalHeight };
		} else {
			const totalWidth = width + 2 * pp;
			const totalHeight = height + 2 * pp;
			return { totalWidth, totalHeight };
		}
	}

	public static getMoldDescription(moldId: string): string {
		const before_ = moldId.split('_')[0];
		const after_ = moldId.split('_')[1];
		return `${after_} - UBI: ${before_}`;
	}

	public static getUnitPriceWithoutDiscount(calculatedItem: CalculatedItem): number {
		return CalculatedItemUtilities.calculatePartsCost(calculatedItem.parts, false);
	}

	public static getUnitPriceWithDiscount(calculatedItem: CalculatedItem): number {
		return CalculatedItemUtilities.calculatePartsCost(
			calculatedItem.parts,
			true,
			calculatedItem.discount
		);
	}

	public static getTotalWithoutDiscount(calculatedItem: CalculatedItem): number {
		return (
			calculatedItem.quantity * CalculatedItemUtilities.getUnitPriceWithoutDiscount(calculatedItem)
		);
	}

	public static getTotal(calculatedItem: CalculatedItem): number {
		return (
			calculatedItem.quantity * CalculatedItemUtilities.getUnitPriceWithDiscount(calculatedItem)
		);
	}

	public static calculatePartsCost(
		parts: CalculatedItemPart[],
		applyDiscount: boolean,
		discount: number = 0
	): number {
		const discountFactor = applyDiscount ? 1 - discount / 100 : 1;
		const prices = parts.map(
			(p) => p.price * p.quantity * (p.discountAllowed ? discountFactor : 1)
		);
		const total = prices.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
		return Math.ceil(total * 100) / 100;
	}

	private static roundUpToNearestGreaterFiveOrTen(value: number): number {
		if (value % 5 === 0) {
			return value;
		}

		return Math.ceil(value / 5) * 5;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static getValueByPath(obj: any, path: (string | number)[]): any {
		return path.reduce((acc, key) => acc && acc[key], obj);
	}
}
