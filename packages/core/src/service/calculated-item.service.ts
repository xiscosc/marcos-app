import { PricingService } from './pricing.service';
import { CalculatedItemRepositoryDynamoDb } from '../repository/dynamodb/calculated-item.repository.dynamodb';
import type { CalculatedItemDto } from '../repository/dto/calculated-item.dto';
import {
	CalculatedItem,
	CalculatedItemPart,
	Order,
	OrderDimensions,
	PreCalculatedItemPart,
	ExternalOrder
} from '../types/order.type';
import { CalculatedItemUtilities } from '../utilities/calculated-item.utilites';
import { PricingType } from '../types/pricing.type';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';

export class CalculatedItemService {
	private calculatedItemRepository: CalculatedItemRepositoryDynamoDb;
	private pricingProvider: PricingService;

	constructor(
		config: ICoreConfiguration | ICoreConfigurationForAWSLambda,
		pricingService?: PricingService
	) {
		this.calculatedItemRepository = new CalculatedItemRepositoryDynamoDb(config);
		this.pricingProvider = pricingService ?? new PricingService(config);
	}

	public async getCalculatedItem(orderId: string): Promise<CalculatedItem | null> {
		const dto = await this.calculatedItemRepository.getCalculatedItemById(orderId);
		return dto ? CalculatedItemService.fromDto(dto) : null;
	}

	public async createCalculatedItem(
		order: Order | ExternalOrder,
		discount: number,
		extraParts: CalculatedItemPart[]
	): Promise<CalculatedItem> {
		const item = order.item;
		const calculatedItem: CalculatedItem = {
			orderId: order.id,
			discount,
			parts: [],
			quantity: item.quantity
		};

		const orderDimensions = CalculatedItemUtilities.getOrderDimensions(
			item.width,
			item.height,
			item.pp,
			item.ppDimensions
		);

		const partPromises: Promise<CalculatedItemPart>[] = item.partsToCalculate.map((p) =>
			this.calculatePart(p, orderDimensions)
		);

		const parts = await Promise.all(partPromises);
		calculatedItem.parts.push(...parts);
		calculatedItem.parts.push(...extraParts);
		return calculatedItem;
	}

	public async calculatePart(
		partToCalculate: PreCalculatedItemPart,
		orderDimensions: OrderDimensions
	): Promise<CalculatedItemPart> {
		const pricingResult = await this.pricingProvider.calculatePrice(
			partToCalculate.type,
			orderDimensions,
			partToCalculate.id,
			partToCalculate.moldId
		);

		return {
			priceId: partToCalculate.id,
			price: pricingResult.price,
			discountAllowed: pricingResult.discountAllowed,
			quantity: partToCalculate.quantity,
			floating: pricingResult.floating,
			description: CalculatedItemService.getDefaultDescriptionByType(
				partToCalculate.type,
				partToCalculate.id,
				pricingResult.description,
				partToCalculate.extraInfo
			)
		};
	}

	public async saveCalculatedItem(calculatedItem: CalculatedItem): Promise<void> {
		await this.calculatedItemRepository.createCalculatedItem(
			CalculatedItemService.toDto(calculatedItem)
		);
	}

	private static fromDto(dto: CalculatedItemDto): CalculatedItem {
		return {
			orderId: dto.orderUuid,
			discount: dto.discount,
			parts: dto.parts.map((p) => ({
				...p,
				discountAllowed: p.discountAllowed ?? true,
				floating: p.floating ?? false
			})),
			quantity: dto.quantity
		};
	}

	private static toDto(calculatedItem: CalculatedItem): CalculatedItemDto {
		return {
			orderUuid: calculatedItem.orderId,
			discount: calculatedItem.discount,
			parts: calculatedItem.parts,
			quantity: calculatedItem.quantity
		};
	}

	private static getDefaultDescriptionByType(
		type: PricingType,
		id: string,
		description?: string,
		extraInfo?: string
	): string {
		switch (type) {
			case PricingType.MOLD:
				return CalculatedItemUtilities.getMoldDescription(id);
			case PricingType.GLASS:
				return CalculatedItemService.getDefaultDescription(`Cristal ${id}`, description, extraInfo);
			case PricingType.BACK:
				return CalculatedItemService.getDefaultDescription(`Trasera ${id}`, description, extraInfo);
			case PricingType.PP:
				return CalculatedItemService.getDefaultDescription(
					`Passepartout ${id}`,
					description,
					extraInfo
				);
			case PricingType.LABOUR:
				return CalculatedItemService.getDefaultDescription(`Montaje ${id}`, description, extraInfo);
			case PricingType.FABRIC:
				return CalculatedItemService.getDefaultDescription(
					`Estirar tela ${id}`,
					description,
					extraInfo
				);
			case PricingType.OTHER:
			case PricingType.HANGER:
			case PricingType.TRANSPORT:
				return CalculatedItemService.getDefaultDescription(`${id}`, description, extraInfo);
			default:
				throw Error('Invalid type');
		}
	}

	private static getDefaultDescription(
		df: string,
		description?: string,
		extraInfo?: string
	): string {
		let computedDescription;
		if (!description || description.trim() === '') {
			computedDescription = df;
		} else {
			computedDescription = description;
		}

		if (extraInfo != null) {
			computedDescription = `${computedDescription} (${extraInfo})`;
		}

		return computedDescription;
	}
}
