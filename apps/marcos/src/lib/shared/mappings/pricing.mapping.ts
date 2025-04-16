import { PricingFormula, PricingType } from '@marcsimolduressonsardina/core/type';
import { type EditablePricingTypes } from '@marcsimolduressonsardina/core/util';

export const otherForPrintPricingTypes = [
	PricingType.FABRIC,
	PricingType.LABOUR,
	PricingType.TRANSPORT,
	PricingType.HANGER,
	PricingType.OTHER
];

export const pricingTypesMap: Record<EditablePricingTypes, string> = {
	[PricingType.GLASS]: 'Cristal',
	[PricingType.PP]: 'PP / Fondo',
	[PricingType.OTHER]: 'Suministros',
	[PricingType.BACK]: 'Trasera',
	[PricingType.LABOUR]: 'Montajes',
	[PricingType.TRANSPORT]: 'Transportes',
	[PricingType.HANGER]: 'Colgadores'
};

export const formulasMap: Record<PricingFormula, string> = {
	[PricingFormula.NONE]: 'Precio unitario sin cálculos',
	[PricingFormula.FORMULA_AREA]: 'Precio por m2',
	[PricingFormula.FORMULA_FIT_AREA_M2]: 'Precio por trozos (≤ m2)',
	[PricingFormula.FORMULA_FIT_AREA]: 'Precio por trozos (≤ d1 x d2)',
	[PricingFormula.FORMULA_LINEAR_SHORT_SIDE]: 'Precio por metro lineal (sólo medida corta)',
	[PricingFormula.FORMULA_LINEAR]: 'Precio por metro lineal (perímetro)',
	[PricingFormula.FORMULA_LEFTOVER]: 'Precio con fórmula m2 * precio * IVA * 5 + 2'
};

export const formulasStringMap: Record<PricingFormula, string> = {
	[PricingFormula.NONE]: '',
	[PricingFormula.FORMULA_AREA]: ' / m2',
	[PricingFormula.FORMULA_FIT_AREA]: '',
	[PricingFormula.FORMULA_FIT_AREA_M2]: '',
	[PricingFormula.FORMULA_LINEAR]: ' / m',
	[PricingFormula.FORMULA_LINEAR_SHORT_SIDE]: ' / m',
	[PricingFormula.FORMULA_LEFTOVER]: ' * m2 * IVA * 5 + 2'
};
