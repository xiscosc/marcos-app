import {
	ICorePublicConfiguration,
	ICorePublicConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { PublicCustomerRepositoryDynamoDb } from '../repository/dynamodb/public-customer.repository.dynamodb';
import { PublicOrderRepositoryDynamoDb } from '../repository/dynamodb/public-order.repository.dynamodb';
import { FullOrder } from '../types';
import { CalculatedItemService } from './calculated-item.service';
import { CustomerService } from './customer.service';
import { OrderService } from './order.service';
import { PricingService } from './pricing.service';

export class PublicReceiptService {
	private readonly publicOrderRepository: PublicOrderRepositoryDynamoDb;
	private readonly publicCustomerRepository: PublicCustomerRepositoryDynamoDb;
	private readonly calculatedItemService: CalculatedItemService;

	constructor(config: ICorePublicConfiguration | ICorePublicConfigurationForAWSLambda) {
		this.publicCustomerRepository = new PublicCustomerRepositoryDynamoDb(config);
		this.publicOrderRepository = new PublicOrderRepositoryDynamoDb(config);
		this.calculatedItemService = new CalculatedItemService(config, new PricingService(config));
	}

	public async getPublicOrder(shortId: string): Promise<FullOrder | null> {
		const orderDto = await this.publicOrderRepository.getOrderByShortId(shortId);
		if (orderDto == null) return null;
		const customerDto = await this.publicCustomerRepository.getCustomerById(orderDto.customerUuid);
		if (customerDto == null) return null;
		const customer = CustomerService.fromDto(customerDto);
		const order = OrderService.fromDto(orderDto, customer);
		const calculatedItem = await this.calculatedItemService.getCalculatedItem(order.id);
		if (calculatedItem == null) return null;

		return {
			order,
			calculatedItem,
			totals: OrderService.getTotalsForOrder(order, calculatedItem)
		};
	}
}
