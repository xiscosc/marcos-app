export type PreCalculatedItemPartDto = {
	type: string;
	id: string;
	quantity: number;
	moldId?: string; // For fabric
	extraInfo?: string; // For extra pp info
};

export type PPDimensionsDto = {
	up: number;
	down: number;
	left: number;
	right: number;
};

export type ItemDto = {
	width: number;
	height: number;
	floatingDistance?: number;
	pp: number;
	ppDimensions?: PPDimensionsDto;
	description: string;
	normalizedDescription: string;
	predefinedObservations: string[];
	observations: string;
	quantity: number;
	deliveryDate: number;
	instantDelivery?: boolean;
	partsToCalculate: PreCalculatedItemPartDto[];
	exteriorWidth?: number;
	exteriorHeight?: number;
	dimensionsType?: string;
};
