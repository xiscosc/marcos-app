import { orderSchema, quoteSchema } from '$lib/shared/order.utilities';
import { setError, superValidate, type SuperValidated } from 'sveltekit-superforms';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import { fail, redirect } from '@sveltejs/kit';
import { PricingHelper } from '../pricing/pricing.helper';
import { AuthService } from '$lib/server/service/auth.service';
import {
	DimensionsType,
	OrderStatus,
	type AllPrices,
	type CalculatedItem,
	type CalculatedItemPart,
	type PricingType
} from '@marcsimolduressonsardina/core/type';
import type { OrderCreationDto } from '@marcsimolduressonsardina/core/dto';
import {
	CalculatedItemService,
	OrderService,
	PricingService
} from '@marcsimolduressonsardina/core/service';
import { InvalidSizeError } from '@marcsimolduressonsardina/core/error';
import { cornersId, otherExtraId, quoteDeliveryDate } from '@marcsimolduressonsardina/core/util';

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
		const partsToCalculate = form.data.partsToCalculate.map((part) => ({
			id: part.id,
			quantity: part.quantity,
			type: part.type as PricingType,
			moldId: part.moldId,
			extraInfo: part.extraInfo
		}));

		const deliveryDate =
			isQuote || form.data.instantDelivery ? quoteDeliveryDate : form.data.deliveryDate;
		if (deliveryDate == null) {
			throw Error('Delivery date can not be empty');
		}

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
			customerId,
			isQuote,
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

	static async handleCreateOrderFormPage(
		locals: App.Locals,
		orderId?: string,
		editing = false
	): Promise<OrderCreationFormData> {
		const appUser = await AuthUtilities.checkAuth(locals);
		const form = await superValidate(zod(orderSchema));
		const config = AuthService.generateConfiguration(appUser);
		const pricing = PricingHelper.getPricing(new PricingService(config));
		const orderService = new OrderService(config);
		const order = orderId != null ? await orderService.getOrderById(orderId) : undefined;
		if (order != null) {
			const calculatedItemService = new CalculatedItemService(config);
			const calculatedItem = await calculatedItemService.getCalculatedItem(order.id);

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

		return { form, pricing, editing, editingStatus: editing ? order?.status : undefined };
	}

	static async handleEditOrder(request: Request, locals: App.Locals, orderId: string) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
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
		return redirect(302, `/orders/${orderId}`);
	}

	static async handleCreateOrder(
		isQuote: boolean,
		request: Request,
		locals: App.Locals,
		customerId?: string
	) {
		const appUser = await AuthUtilities.checkAuth(locals);
		const schema = isQuote ? quoteSchema : orderSchema;
		const form = await superValidate(request, zod(schema));
		console.log(form.errors);

		if (!form.valid) {
			return fail(400, { form });
		}

		const orderService = new OrderService(AuthService.generateConfiguration(appUser));
		let orderId = '';

		try {
			const orderDto = await OrderCreationUtilities.createOrderDtoFromForm(
				form,
				isQuote,
				customerId
			);

			const order = await orderService.createOrderFromDto(orderDto);
			if (order === null) {
				console.log('Error creating quote');
				return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
			}

			orderId = order.id;
		} catch (error: unknown) {
			console.log(error);
			if (error instanceof InvalidSizeError) {
				return setError(form, '', error.message);
			}

			return setError(form, '', 'Error creando el pedido / presupuesto. Intente de nuevo.');
		}

		if (customerId == null) {
			return redirect(302, `/orders/${orderId}/link`);
		} else {
			return redirect(302, `/orders/${orderId}/files`);
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
}
