export enum PricingType {
	MOLD = 'mold',
	GLASS = 'glass',
	BACK = 'back',
	PP = 'pp',
	FABRIC = 'fabric',
	LABOUR = 'labour',
	TRANSPORT = 'transport',
	HANGER = 'hanger',
	OTHER = 'other'
}

export enum PricingFormula {
	FORMULA_LINEAR = 'formula_linear',
	FORMULA_LEFTOVER = 'formula_leftover',
	FORMULA_FIT_AREA = 'formula_fit_area',
	FORMULA_AREA = 'formula_area',
	FORMULA_LINEAR_SHORT_SIDE = 'formula_linear_short_side',
	FORMULA_FIT_AREA_M2 = 'formula_fit_area_m2',
	NONE = 'none'
}

export type MaxArea = {
	d1: number;
	d2: number;
	price: number;
};

export type MaxAreaM2 = {
	a: number;
	price: number;
};

export type ListPrice = {
	id: string;
	internalId: string;
	price: number;
	minPrice: number;
	discountAllowed: boolean;
	description: string;
	type: PricingType;
	formula: PricingFormula;
	areas: MaxArea[];
	areasM2: MaxAreaM2[];
	priority: number;
	floating: boolean;
	maxD1?: number;
	maxD2?: number;
};

export type ListPriceWithMold = {
	moldId?: string;
} & ListPrice;

export type AllPrices = {
	moldPrices: ListPrice[];
	glassPrices: ListPrice[];
	ppPrices: ListPrice[];
	backPrices: ListPrice[];
	labourPrices: ListPrice[];
	otherPrices: ListPrice[];
	transportPrices: ListPrice[];
	hangerPrices: ListPrice[];
};
