export type MaxAreaDto = {
	d1: number;
	d2: number;
	price: number;
};

export type MaxAreaM2Dto = {
	a: number;
	price: number;
};

export type ListPriceDto = {
	id: string;
	uuid: string;
	price: number;
	minPrice?: number;
	discountAllowed?: boolean;
	description: string;
	type: string;
	formula: string;
	areas: MaxAreaDto[];
	areasM2?: MaxAreaM2Dto[];
	maxD1?: number;
	maxD2?: number;
	priority?: number;
	floating?: boolean;
};
