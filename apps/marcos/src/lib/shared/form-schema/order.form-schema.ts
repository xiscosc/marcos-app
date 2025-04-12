import { z } from 'zod';
import { DimensionsType, OrderStatus } from '@marcsimolduressonsardina/core/type';
import { allPricingTypes, otherExtraId } from '@marcsimolduressonsardina/core/util';
import { DateTime } from 'luxon';

const extraPartSchema = z.object({
	priceId: z.string().default(otherExtraId),
	price: z.number().min(0).default(0),
	quantity: z.number().int().min(1).default(1),
	discountAllowed: z.boolean().default(true),
	description: z.string().default(''),
	floating: z.boolean().default(false)
});

const partToCalculateSchema = z.object({
	id: z.string(),
	quantity: z.number().int().min(1).default(1),
	type: z.enum(allPricingTypes as [string, ...string[]]),
	moldId: z.string().optional(),
	extraInfo: z.string().optional()
});

const ppDimensionsSchema = z.object({
	up: z.number().min(0),
	down: z.number().min(0),
	left: z.number().min(0),
	right: z.number().min(0)
});

export const baseOderSchema = z.object({
	width: z.number().min(0),
	height: z.number().min(0),
	description: z.string().default(''),
	floatingDistance: z.number().min(0).default(0),
	observations: z.string().default(''),
	quantity: z.number().int().min(1).default(1),
	dimenstionsType: z
		.enum(Object.values(DimensionsType) as [string, ...string[]])
		.default(DimensionsType.NORMAL),
	pp: z.coerce.number().min(0).default(0),
	ppDimensions: ppDimensionsSchema.optional(),
	discount: z.string().default(''),
	extraParts: z.array(extraPartSchema),
	partsToCalculate: z.array(partToCalculateSchema),
	predefinedDescriptions: z.array(z.string()).default([]),
	predefinedObservations: z.array(z.string()).default([]),
	hasArrow: z.boolean().default(false),
	exteriorWidth: z.number().optional(),
	exteriorHeight: z.number().optional(),
	instantDelivery: z.boolean().default(false),
	markup: z.number().min(0).default(0).optional()
});

export const orderSchema = baseOderSchema
	.extend({
		deliveryDate: z.date().optional()
	})
	.superRefine((data, ctx) => {
		const yesterday = DateTime.now().minus({ days: 1 }).toJSDate();

		// If isExpress is false and deliveryDate is missing or invalid
		if (!data.instantDelivery && (!data.deliveryDate || data.deliveryDate < yesterday)) {
			ctx.addIssue({
				code: 'custom', // Add the required 'code' property
				path: ['deliveryDate'], // The path of the property causing the error
				message: 'If not instantDelivery, delivery date must be set and after yesterday'
			});
		}
	});

export const promoteOrderSchema = z.object({
	deliveryDate: z
		.date({ message: 'La fecha es obligatoria' })
		.min(DateTime.now().minus({ days: 1 }).toJSDate(), {
			message: 'La fecha no es correcta, debe ser igual o posterior a hoy'
		})
});

export type PromoteOrderSchema = typeof promoteOrderSchema;

export const quoteSchema = baseOderSchema.extend({
	deliveryDate: z.date().optional()
});

export const locationOrderSchema = z.object({
	location: z.string().min(1, { message: 'La ubicación no puede estar vacía' })
});

export const statusOrderSchema = z
	.object({
		status: z.enum([OrderStatus.FINISHED, OrderStatus.PENDING, OrderStatus.PICKED_UP] as [
			string,
			...string[]
		]),
		location: z.string().optional()
	})
	.refine((data) => data.location != null || data.status !== OrderStatus.FINISHED.toString(), {
		message: 'La ubicación es obligatoria para pedidos finalizados',
		path: ['location']
	});

export type LocationOrderSchema = typeof locationOrderSchema;

export type StatusOrderSchema = typeof statusOrderSchema;

export const orderPublicIdSchema = z.object({
	id: z
		.string({ message: 'El id es obligatorio' })
		.min(13, { message: 'El id debe tener al menos 13 caracteres' })
		.refine(
			(value) => {
				const slashCount = (value.match(/\//g) || []).length;
				return slashCount === 2;
			},
			{ message: 'El id debe contener exactamente 2 barras (/)' }
		)
});

export type OrderPublicIdSchema = typeof orderPublicIdSchema;
