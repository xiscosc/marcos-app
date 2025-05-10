import {
	AllPrices,
	ListPrice,
	ListPriceWithMold,
	MaxArea,
	MaxAreaM2,
	PricingFormula,
	PricingType
} from '../types/pricing.type';

export const fabricIds = {
	labour: 'fabric',
	short: 'fabric_short',
	long: 'fabric_long'
};

export const fabricDefaultPricing: ListPrice = {
	id: fabricIds.labour,
	internalId: '',
	price: 0,
	minPrice: 0,
	discountAllowed: true,
	description: 'Estirar tela',
	type: PricingType.FABRIC,
	formula: PricingFormula.NONE,
	areas: [],
	areasM2: [],
	maxD1: 300,
	maxD2: 250,
	priority: 1,
	floating: false
};

export const emptyPricing: AllPrices = {
	moldPrices: [],
	glassPrices: [],
	ppPrices: [],
	backPrices: [],
	otherPrices: [],
	labourPrices: [],
	transportPrices: [],
	hangerPrices: []
};

export type EditablePricingTypes =
	| PricingType.BACK
	| PricingType.GLASS
	| PricingType.PP
	| PricingType.LABOUR
	| PricingType.TRANSPORT
	| PricingType.HANGER
	| PricingType.OTHER;

export const newEditablePricingTypes = [
	PricingType.BACK,
	PricingType.GLASS,
	PricingType.PP,
	PricingType.LABOUR,
	PricingType.TRANSPORT,
	PricingType.HANGER,
	PricingType.OTHER
];

export const editablePricingTypes = [...newEditablePricingTypes, PricingType.MOLD];

export const allPricingTypes = [...editablePricingTypes, PricingType.FABRIC];

export const noDimensionCheckPricingTypes = [
	PricingType.OTHER,
	PricingType.TRANSPORT,
	PricingType.HANGER
];

export const fitFormulas = [PricingFormula.FORMULA_FIT_AREA, PricingFormula.FORMULA_FIT_AREA_M2];

export class PricingUtilites {
	static getPriceString(
		price: ListPrice,
		formulasStringMap: Record<PricingFormula, string>
	): string {
		if (price.formula !== PricingFormula.FORMULA_FIT_AREA) {
			return `${price.price.toFixed(2)}€${formulasStringMap[price.formula]}`;
		}

		const prices = price.areas.map((a) => a.price);
		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);
		return `${minPrice.toFixed(2)}€ - ${maxPrice.toFixed(2)}€`;
	}

	static getFabricCrossbarDimension(id: string, d1: number, d2: number): number {
		return id === fabricIds.long ? Math.max(d1, d2) : Math.min(d1, d2);
	}

	static generateCrossbarPricing(
		id: string,
		price: number,
		moldDescription: string,
		dimension: number,
		moldId: string
	): ListPriceWithMold {
		return {
			id,
			internalId: '',
			price,
			minPrice: 0,
			discountAllowed: true,
			description: `Travesaño (${moldDescription}) ${dimension}cm`,
			type: PricingType.FABRIC,
			formula: PricingFormula.NONE,
			areas: [],
			areasM2: [],
			maxD1: 300,
			maxD2: 265,
			priority: 1,
			moldId,
			floating: false
		};
	}

	static cleanFormValues(form: {
		data: {
			formula: PricingFormula;
			areas: MaxArea[];
			areasM2: MaxAreaM2[];
			price: number;
			maxD1: number;
			maxD2: number;
		};
	}) {
		if (fitFormulas.includes(form.data.formula)) {
			const price = 0;
			const maxD1 = undefined;
			const maxD2 = undefined;
			let areas: MaxArea[] = [];
			let areasM2: MaxAreaM2[] = [];
			if (form.data.formula === PricingFormula.FORMULA_FIT_AREA) {
				areas = form.data.areas;
			}

			if (form.data.formula === PricingFormula.FORMULA_FIT_AREA_M2) {
				areasM2 = form.data.areasM2;
			}
			return { price, maxD1, maxD2, areas, areasM2 };
		} else {
			const price = form.data.price;
			const maxD1 = form.data.maxD1;
			const maxD2 = form.data.maxD2;
			const areas: MaxArea[] = [];
			const areasM2: MaxAreaM2[] = [];
			return { price, maxD1, maxD2, areas, areasM2 };
		}
	}
}
