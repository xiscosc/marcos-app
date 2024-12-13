import { PricingFormula, PricingType } from '@marcsimolduressonsardina/core/type';
import {
	editablePricingTypes,
	newEditablePricingTypes,
	type EditablePricingTypes
} from '@marcsimolduressonsardina/core/util';
import { z } from 'zod';

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

const areaSchema = z.object({
	d1: z.number().min(1.0),
	d2: z.number().min(1.0),
	price: z.number().min(0)
});

const areaM2Schema = z.object({
	a: z.number().min(0),
	price: z.number().min(0)
});

const listPriceSchema = {
	id: z
		.string()
		.regex(/^[^\s]*$/, { message: 'El id no puede contener espacios' })
		.min(3, { message: 'El id debe tener al menos 3 caracteres' }),
	price: z.number().min(0, { message: 'El precio no puede ser negativo' }),
	minPrice: z.number().min(0, { message: 'El precio minimo no puede ser negativo' }),
	discountAllowed: z.boolean().default(true),
	description: z.string().min(1, { message: 'La descripción no puede estar vacía' }),
	type: z.enum(newEditablePricingTypes as [string, ...string[]]),
	formula: z.enum([
		PricingFormula.FORMULA_LEFTOVER,
		PricingFormula.FORMULA_FIT_AREA,
		PricingFormula.FORMULA_FIT_AREA_M2,
		PricingFormula.FORMULA_AREA,
		PricingFormula.FORMULA_LINEAR,
		PricingFormula.FORMULA_LINEAR_SHORT_SIDE,
		PricingFormula.NONE
	]),
	areas: z.array(areaSchema).default([]),
	areasM2: z.array(areaM2Schema).default([]),
	maxD1: z.number().optional(),
	maxD2: z.number().optional(),
	priority: z.number().default(0)
};

export const listPriceSchemaNew = z.object({
	...listPriceSchema,
	type: z.enum(newEditablePricingTypes as [string, ...string[]])
});

export type LisPriceSchemaNew = typeof listPriceSchemaNew;

export const listPriceSchemaEdit = z.object({
	...listPriceSchema,
	type: z.enum(editablePricingTypes as [string, ...string[]])
});

export type LisPriceSchemaEdit = typeof listPriceSchemaEdit;
