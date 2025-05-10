import { v4 as uuidv4 } from 'uuid';
import {
	leftoverPricing,
	fitAreaPricing,
	getFabricPrice,
	getMoldPrice,
	areaPricing,
	getCrossbarPrice,
	linearPricing,
	fitAreaM2Pricing,
	linearPricingShortSide
} from '../data/static-pricing';
import type { ListPriceDto } from '../repository/dto/list-price.dto';
import { ListPricingRepositoryDynamoDb } from '../repository/dynamodb/list-pricing.repository.dynamodb';
import { InvalidSizeError } from '../error/invalid-size.error';
import {
	PricingUtilites,
	fabricDefaultPricing,
	fabricIds,
	fitFormulas,
	noDimensionCheckPricingTypes
} from '../utilities/pricing.utilites';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { ListPrice, MaxArea, MaxAreaM2, PricingFormula, PricingType } from '../types/pricing.type';
import { OrderDimensions } from '../types/order.type';

export class PricingService {
	private listPricingRepository: ListPricingRepositoryDynamoDb;
	private markup: number;

	constructor(config: ICoreConfiguration | ICoreConfigurationForAWSLambda, markup?: number) {
		this.markup = markup ? markup / 100 : 0;
		this.listPricingRepository = new ListPricingRepositoryDynamoDb(config);
	}

	public async getPricingList(type: PricingType): Promise<ListPrice[]> {
		const prices = await this.listPricingRepository.getAllPricesByType(type);
		return this.getPricesWithMarkup(prices.map((p) => PricingService.fromDto(p)));
	}

	public async getPriceListByInternalId(id: string): Promise<ListPrice | undefined> {
		const priceDto = await this.listPricingRepository.getByInternalId(id);
		return priceDto ? this.getPriceWithMarkup(PricingService.fromDto(priceDto)) : undefined;
	}

	public async batchStoreListPrices(type: PricingType, prices: ListPrice[]): Promise<void> {
		await this.listPricingRepository.batchStoreListPrices(
			type,
			prices
				.filter((price) => price.type === type)
				.map((price) => PricingService.toDto(PricingService.cleanAndVerifyEntity(price)))
		);
	}

	public async deleteListPrices(listPrices: ListPrice[]): Promise<void> {
		await this.listPricingRepository.deleteListPrices(
			listPrices.map((listPrice) => listPrice.internalId)
		);
	}

	public async updatePricing(listPrice: ListPrice): Promise<void> {
		await this.listPricingRepository.storeListPrice(
			PricingService.toDto(PricingService.cleanAndVerifyEntity(listPrice))
		);
	}

	public async createPricing(
		id: string,
		price: number,
		minPrice: number,
		discountAllowed: boolean,
		description: string,
		type: PricingType,
		formula: PricingFormula,
		areas: MaxArea[] = [],
		areasM2: MaxAreaM2[] = [],
		priority: number,
		maxD1?: number,
		maxD2?: number
	): Promise<void> {
		const listPrice: ListPrice = {
			id,
			internalId: uuidv4(),
			price,
			minPrice,
			discountAllowed,
			description,
			type,
			formula,
			areas,
			areasM2,
			maxD1,
			maxD2,
			priority,
			floating: false
		};

		await this.listPricingRepository.storeListPrice(
			PricingService.toDto(PricingService.cleanAndVerifyEntity(listPrice))
		);
	}

	public async calculatePrice(
		pricingType: PricingType,
		orderDimensions: OrderDimensions,
		id: string,
		moldFabricId?: string
	): Promise<{
		price: number;
		description: string;
		discountAllowed: boolean;
		floating: boolean;
	}> {
		const pricing =
			pricingType === PricingType.FABRIC
				? await this.getFabricPriceList(id, orderDimensions, moldFabricId)
				: await this.getPriceFromListById(pricingType, id);

		PricingService.checkMaxMinDimensions(orderDimensions, pricing);
		const price = PricingService.getPriceByType(orderDimensions, pricing);
		return {
			price: Math.max(price, pricing.minPrice),
			description: pricing.description,
			discountAllowed: pricing.discountAllowed,
			floating: pricing.floating
		};
	}

	public async getPriceFromListById(pricingType: PricingType, id: string): Promise<ListPrice> {
		const priceDto = await this.listPricingRepository.getByTypeAndId(pricingType, id);
		if (priceDto == null) {
			throw Error('Price not found');
		}

		return this.getPriceWithMarkup(PricingService.fromDto(priceDto));
	}

	public calculatePriceWithoutMarkup(price: number): number {
		if (this.markup === 0) {
			return price;
		}

		return Math.round((price / (1 + this.markup)) * 100) / 100;
	}

	private async getFabricPriceList(
		id: string,
		orderDimensions: OrderDimensions,
		moldFabricId?: string
	): Promise<ListPrice> {
		if (id === fabricIds.labour) {
			return fabricDefaultPricing;
		}

		if (moldFabricId == null) {
			throw Error('Mold fabric id is required');
		}

		const { d1, d2 } = PricingService.cleanAndOrderTotalDimensions(orderDimensions);
		const moldPrice = await this.getPriceFromListById(PricingType.MOLD, moldFabricId);
		const fabricPrice = PricingUtilites.generateCrossbarPricing(
			id,
			moldPrice.price,
			moldPrice.description,
			PricingUtilites.getFabricCrossbarDimension(id, d1, d2),
			moldPrice.id
		);

		return this.getPriceWithMarkup(fabricPrice);
	}

	private calculateMarkup(price: number): number {
		return Math.round(price * (1 + this.markup) * 100) / 100;
	}

	private getPriceWithMarkup(listPrice: ListPrice): ListPrice {
		if (this.markup === 0) {
			return listPrice;
		}

		return {
			...listPrice,
			price: this.calculateMarkup(listPrice.price),
			minPrice: this.calculateMarkup(listPrice.minPrice),
			areas: listPrice.areas.map((area) => ({
				...area,
				price: this.calculateMarkup(area.price)
			})),
			areasM2: listPrice.areasM2.map((area) => ({
				...area,
				price: this.calculateMarkup(area.price)
			}))
		};
	}

	private getPricesWithMarkup(listPrices: ListPrice[]): ListPrice[] {
		if (this.markup === 0) {
			return listPrices;
		}

		return listPrices.map((lp) => this.getPriceWithMarkup(lp));
	}

	private static getPriceByType(orderDimensions: OrderDimensions, priceInfo: ListPrice): number {
		switch (priceInfo.type) {
			case PricingType.MOLD:
				return PricingService.getMoldPrice(priceInfo, orderDimensions);
			case PricingType.FABRIC:
				return PricingService.getFabricPrice(priceInfo, orderDimensions);
			case PricingType.BACK:
			case PricingType.GLASS:
			case PricingType.OTHER:
			case PricingType.TRANSPORT:
			case PricingType.HANGER:
			case PricingType.LABOUR:
			case PricingType.PP:
				return PricingService.getPriceByFormula(priceInfo, orderDimensions);
			default:
				throw Error('Pricing type not supported');
		}
	}

	private static getMoldPrice(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
		return getMoldPrice(priceInfo.price, d1, d2);
	}

	private static getFabricPrice(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
		const { d1: d1t, d2: d2t } = PricingService.cleanAndOrderTotalDimensions(orderDimensions);
		if (priceInfo.id === fabricIds.labour) {
			return getFabricPrice(d1, d2);
		} else {
			return getCrossbarPrice(
				priceInfo.price,
				PricingUtilites.getFabricCrossbarDimension(priceInfo.id, d1t, d2t)
			);
		}
	}

	private static getDimensionsByFormula(
		formula: PricingFormula,
		orderDimensions: OrderDimensions
	): { d1: number; d2: number } {
		switch (formula) {
			case PricingFormula.FORMULA_LEFTOVER:
				return PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
			case PricingFormula.FORMULA_FIT_AREA:
			case PricingFormula.FORMULA_FIT_AREA_M2:
			case PricingFormula.FORMULA_AREA:
			case PricingFormula.FORMULA_LINEAR:
			case PricingFormula.FORMULA_LINEAR_SHORT_SIDE:
			case PricingFormula.NONE:
				return PricingService.cleanAndOrderTotalDimensions(orderDimensions);
			default:
				throw Error('Formula not found');
		}
	}

	private static getDimensionsByType(
		price: ListPrice,
		orderDimensions: OrderDimensions
	): { d1: number; d2: number } {
		switch (price.type) {
			case PricingType.MOLD:
			case PricingType.FABRIC:
				return PricingService.cleanAndOrderWorkingDimensions(orderDimensions);
			default:
				return PricingService.getDimensionsByFormula(price.formula, orderDimensions);
		}
	}

	private static getPriceByFormula(priceInfo: ListPrice, orderDimensions: OrderDimensions): number {
		const { d1, d2 } = PricingService.getDimensionsByFormula(priceInfo.formula, orderDimensions);
		switch (priceInfo.formula) {
			case PricingFormula.FORMULA_LEFTOVER:
				return leftoverPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_FIT_AREA:
				return fitAreaPricing(priceInfo, d1, d2);
			case PricingFormula.FORMULA_FIT_AREA_M2:
				return fitAreaM2Pricing(priceInfo, d1, d2);
			case PricingFormula.FORMULA_AREA:
				return areaPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_LINEAR:
				return linearPricing(priceInfo.price, d1, d2);
			case PricingFormula.FORMULA_LINEAR_SHORT_SIDE:
				return linearPricingShortSide(priceInfo.price, d1, d2);
			case PricingFormula.NONE:
				return priceInfo.price;
			default:
				throw Error('Formula not found');
		}
	}

	private static cleanAndVerifyEntity(listPrice: ListPrice): ListPrice {
		if (listPrice.formula === PricingFormula.FORMULA_FIT_AREA && listPrice.areas.length === 0) {
			throw Error('Areas are required for fit area pricing');
		}

		if (
			listPrice.formula === PricingFormula.FORMULA_FIT_AREA_M2 &&
			listPrice.areasM2.length === 0
		) {
			throw Error('Areas m2 are required for fit area m2 pricing');
		}

		if (
			!fitFormulas.includes(listPrice.formula) &&
			(listPrice.price == null || (listPrice.price < 0 && listPrice.type !== PricingType.MOLD))
		) {
			throw Error('No price provided for this formula');
		}

		if (fitFormulas.includes(listPrice.formula)) {
			listPrice.price = 0;
			if (listPrice.formula !== PricingFormula.FORMULA_FIT_AREA) {
				listPrice.areas = [];
			}

			if (listPrice.formula !== PricingFormula.FORMULA_FIT_AREA_M2) {
				listPrice.areasM2 = [];
			}
		} else {
			listPrice.areas = [];
			listPrice.areasM2 = [];
		}

		if (listPrice.type === PricingType.MOLD) {
			listPrice.maxD1 = 300;
			listPrice.maxD2 = 265;
			listPrice.formula = PricingFormula.NONE;
		}

		return listPrice;
	}

	private static cleanAndOrder(d1d: number, d2d: number, floor: boolean = true) {
		const max = Math.max(d1d, d2d);
		const min = Math.min(d1d, d2d);
		if (floor) {
			return { d1: Math.floor(max), d2: Math.floor(min) };
		} else {
			return { d1: max, d2: min };
		}
	}

	private static cleanAndOrderWorkingDimensions(orderDimensions: OrderDimensions) {
		return PricingService.cleanAndOrder(
			orderDimensions.workingHeight,
			orderDimensions.workingWidth
		);
	}

	private static cleanAndOrderTotalDimensions(orderDimensions: OrderDimensions) {
		return PricingService.cleanAndOrder(
			orderDimensions.totalHeight,
			orderDimensions.totalWidth,
			false
		);
	}

	private static checkMaxMinDimensions(orderDimensions: OrderDimensions, pricing: ListPrice) {
		if (
			pricing.formula === PricingFormula.NONE &&
			noDimensionCheckPricingTypes.includes(pricing.type)
		)
			return;
		const { d1: d1w, d2: d2w } = PricingService.getDimensionsByType(pricing, orderDimensions);
		if (pricing.maxD1 != null && pricing.maxD2 != null) {
			const { d1, d2 } = PricingService.cleanAndOrder(pricing.maxD1, pricing.maxD2);
			if (d1w > d1 || d2w > d2)
				throw new InvalidSizeError(
					`Dimensiones máximas superadas para ${pricing.description} (${pricing.id}). Max: ${d1}x${d2}`
				);
		}
	}

	private static toDto(price: ListPrice): ListPriceDto {
		return {
			id: price.id,
			uuid: price.internalId,
			price: price.price,
			description: price.description,
			type: price.type,
			formula: price.formula,
			areas: price.areas,
			areasM2: price.areasM2,
			maxD1: price.maxD1,
			maxD2: price.maxD2,
			priority: price.priority,
			minPrice: price.minPrice,
			discountAllowed: price.discountAllowed,
			floating: price.floating
		};
	}

	private static fromDto(dto: ListPriceDto): ListPrice {
		return {
			id: dto.id,
			internalId: dto.uuid,
			price: dto.price,
			description: dto.description,
			type: dto.type as PricingType,
			formula: dto.formula as PricingFormula,
			areas: dto.areas,
			areasM2: dto.areasM2 ?? [],
			maxD1: dto.maxD1,
			maxD2: dto.maxD2,
			priority: dto.priority ?? 0,
			minPrice: dto.minPrice ?? 0,
			discountAllowed: dto.discountAllowed ?? true,
			floating: dto.floating ?? false
		};
	}
}
