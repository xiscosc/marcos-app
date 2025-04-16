import { orderSchema, quoteSchema } from '$lib/shared/form-schema/order.form-schema';
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { PricingHelper } from '../pricing/pricing.helper';
import { AuthService } from '$lib/server/service/auth.service';
import {
	DimensionsType,
	OrderStatus,
	type AllPrices,
	type CalculatedItem,
	type CalculatedItemPart,
	type ExternalFullOrder,
	type PricingType
} from '@marcsimolduressonsardina/core/type';
import type {
	ExternalOrderCreationDto,
	OrderCreationDto,
	OrderCreationDtoBase
} from '@marcsimolduressonsardina/core/dto';
import { OrderService, PricingService } from '@marcsimolduressonsardina/core/service';
import { InvalidSizeError } from '@marcsimolduressonsardina/core/error';
import { cornersId, otherExtraId, quoteDeliveryDate } from '@marcsimolduressonsardina/core/util';
import { trackServerEvent } from '../analytics/posthog';

type OrderTypeForm = z.infer<typeof orderSchema>;
type QuoteTypeForm = z.infer<typeof quoteSchema>;

export type OrderCreationFormData = {
	pricing: Promise<AllPrices>;
	form: SuperValidated<OrderTypeForm | QuoteTypeForm>;
	editing: boolean;
	editingStatus?: OrderStatus;
};

export class OrderCreationUtilities {
	static createOrderDtoFromForm(
		form: SuperValidated<OrderTypeForm | QuoteTypeForm>,
		isQuote: boolean,
		customerId?: string
	): OrderCreationDto {
		const deliveryDate =
			isQuote || form.data.instantDelivery ? quoteDeliveryDate : form.data.deliveryDate;
		if (deliveryDate == null) {
			throw Error('Delivery date can not be empty');
		}

		const orderCreationDtoBase = OrderCreationUtilities.getOrderCreationDtoBase(form, deliveryDate);
		return {
			...orderCreationDtoBase,
			isQuote,
			customerId
		};
	}

	static createExternalOrderDtoFromForm(
		form: SuperValidated<OrderTypeForm>
	): ExternalOrderCreationDto {
		const deliveryDate = form.data.instantDelivery ? quoteDeliveryDate : form.data.deliveryDate;
		if (deliveryDate == null) {
			throw Error('Delivery date can not be empty');
		}

		const orderDto = OrderCreationUtilities.getOrderCreationDtoBase(form, deliveryDate);
		return {
			...orderDto,
			markup: form.data.markup ?? 0
		};
	}

	static async handleCreateOrderFormPage(
		locals: App.Locals,
		orderId?: string,
		editing = false
	): Promise<OrderCreationFormData> {
		const form = await superValidate(zod(orderSchema));
		const config = AuthService.generateConfiguration(locals.user!);
		const pricingService = new PricingService(config);
		const pricing = PricingHelper.getPricing(pricingService);
		const orderService = new OrderService(config, undefined, undefined, pricingService);
		const fullOrder = orderId != null ? await orderService.getFullOrderById(orderId) : undefined;
		if (fullOrder != null) {
			const order = fullOrder.order;
			const calculatedItem = fullOrder.calculatedItem;

			if (calculatedItem != null) {
				if (editing && order.status !== OrderStatus.QUOTE) {
					form.data.deliveryDate = order.item.deliveryDate;
				}

				form.data.description = order.item.description;
				form.data.discount = String(calculatedItem.discount);
				form.data.floatingDistance = order.item.floatingDistance;
				form.data.exteriorHeight = order.item.exteriorHeight;
				form.data.exteriorWidth = order.item.exteriorWidth;
				form.data.extraParts = OrderCreationUtilities.getExtraParts(calculatedItem);
				form.data.hasArrow = order.hasArrow;
				form.data.height = order.item.height;
				form.data.observations = order.item.observations;
				form.data.partsToCalculate = order.item.partsToCalculate;
				form.data.pp = order.item.pp;
				form.data.ppDimensions = order.item.ppDimensions;
				form.data.predefinedObservations = order.item.predefinedObservations;
				form.data.quantity = order.item.quantity;
				form.data.width = order.item.width;
				form.data.dimenstionsType = order.item.dimensionsType;
				form.data.instantDelivery = order.item.instantDelivery;
			}
		}

		return {
			form,
			pricing,
			editing,
			editingStatus: editing ? fullOrder?.order.status : undefined
		};
	}

	static async handleEditOrder(request: Request, locals: App.Locals, orderId: string) {
		const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
		const order = await orderService.getOrderById(orderId);
		if (order == null) {
			return fail(404, {});
		}

		const isQuote = order.status === OrderStatus.QUOTE;
		const schema = isQuote ? quoteSchema : orderSchema;
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const orderDto = OrderCreationUtilities.createOrderDtoFromForm(
				form,
				isQuote,
				order.customer.id
			);

			await orderService.updateOrderFromDto(orderId, orderDto);
		} catch (error: unknown) {
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error actualizando el pedido / presupuesto. Intente de nuevo.');
		}

		await trackServerEvent(
			locals.user!,
			{
				event: 'order_updated',
				orderId
			},
			locals.posthog
		);
		redirect(302, `/orders/${orderId}`);
	}

	static async handleCreateOrder(request: Request, locals: App.Locals, customerId?: string) {
		return await OrderCreationUtilities.handleCreateOrderOrQuote(
			false,
			request,
			locals,
			customerId
		);
	}

	static async handleCreateQuote(request: Request, locals: App.Locals, customerId?: string) {
		return await OrderCreationUtilities.handleCreateOrderOrQuote(true, request, locals, customerId);
	}

	static async handleCreateExternalOrder(request: Request, locals: App.Locals) {
		const form = await superValidate(request, zod(orderSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const markup = form.data.markup ?? 0;
		const config = AuthService.generateConfiguration(locals.user!);
		const pricingService = new PricingService(config, markup);
		const orderService = new OrderService(config, undefined, undefined, pricingService);
		let orderId = '';
		let fullOrder: ExternalFullOrder | undefined;

		try {
			const orderDto = await OrderCreationUtilities.createExternalOrderDtoFromForm(form);
			fullOrder = await orderService.createExternalOrderFromDto(orderDto);
			if (fullOrder === null) {
				return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
			}

			orderId = fullOrder.order.id;

			await trackServerEvent(
				locals.user!,
				{
					event: 'external_order_created',
					orderId,
					properties: {
						reference: fullOrder.order.reference,
						orderPublicId: fullOrder.order.publicId,
						amount: fullOrder.totals
					}
				},
				locals.posthog
			);

			// Note: This cookie will be included in the redirect response
		} catch (error: unknown) {
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
		}

		return { form, fullOrder };
	}

	private static async handleCreateOrderOrQuote(
		isQuote: boolean,
		request: Request,
		locals: App.Locals,
		customerId?: string
	) {
		const schema = isQuote ? quoteSchema : orderSchema;
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const orderService = new OrderService(AuthService.generateConfiguration(locals.user!));
		let orderId = '';

		try {
			const orderDto = await OrderCreationUtilities.createOrderDtoFromForm(
				form,
				isQuote,
				customerId
			);

			const fullOrder = await orderService.createOrderFromDto(orderDto);
			if (fullOrder === null) {
				return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
			}

			orderId = fullOrder.order.id;

			await trackServerEvent(
				locals.user!,
				{
					event: 'order_created',
					orderId,
					properties: {
						status: isQuote ? OrderStatus.QUOTE : OrderStatus.PENDING,
						amount: fullOrder.totals.total
					}
				},
				locals.posthog
			);
		} catch (error: unknown) {
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
		}

		if (customerId == null) {
			redirect(302, `/orders/${orderId}/link`);
		} else {
			redirect(302, `/orders/${orderId}/files`);
		}
	}

	private static getExtraParts(calculatedItem: CalculatedItem): CalculatedItemPart[] {
		const extraPartIds = [cornersId, otherExtraId];
		return calculatedItem.parts.filter((part) => extraPartIds.indexOf(part.priceId) > -1);
	}

	private static getExteriorDimensions(
		dimensionsType: DimensionsType,
		exteriorWidth?: number,
		exteriorHeight?: number
	): { exteriorHeight?: number; exteriorWidth?: number } {
		if (dimensionsType === DimensionsType.EXTERIOR) {
			return { exteriorHeight, exteriorWidth };
		}

		return { exteriorHeight: undefined, exteriorWidth: undefined };
	}

	private static getOrderCreationDtoBase(
		form: SuperValidated<OrderTypeForm | QuoteTypeForm>,
		deliveryDate: Date
	): OrderCreationDtoBase {
		const partsToCalculate = form.data.partsToCalculate.map((part) => ({
			id: part.id,
			quantity: part.quantity,
			type: part.type as PricingType,
			moldId: part.moldId,
			extraInfo: part.extraInfo
		}));

		const { exteriorHeight, exteriorWidth } = OrderCreationUtilities.getExteriorDimensions(
			form.data.dimenstionsType as DimensionsType,
			form.data.exteriorWidth,
			form.data.exteriorHeight
		);

		const description =
			form.data.description.length === 0
				? form.data.predefinedDescriptions.join(', ')
				: form.data.description;

		return {
			width: form.data.width,
			height: form.data.height,
			pp: form.data.pp ?? 0,
			floatingDistance: form.data.floatingDistance,
			description,
			predefinedObservations: form.data.predefinedObservations,
			observations: form.data.observations,
			quantity: form.data.quantity,
			deliveryDate,
			partsToCalculate: partsToCalculate,
			extraParts: form.data.extraParts,
			discount: parseInt(form.data.discount),
			hasArrow: form.data.hasArrow,
			ppDimensions: form.data.ppDimensions,
			exteriorWidth: exteriorWidth,
			exteriorHeight: exteriorHeight,
			dimensionsType: form.data.dimenstionsType as DimensionsType,
			instantDelivery: form.data.instantDelivery
		};
	}
}
