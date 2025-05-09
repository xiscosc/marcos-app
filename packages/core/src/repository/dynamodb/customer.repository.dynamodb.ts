import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { InvalidKeyError } from '../../error/invalid-key.error';
import type { CustomerDto } from '../dto/customer.dto';
import { CustomerSecondaryIndexNames, customerTableBuilder } from './table/table.builders.dynamodb';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import {
	DynamoFilterElement,
	DynamoFilterExpression,
	DynamoQueryExpression,
	IDynamoPaginatedResult
} from '@balerial/dynamo/type';

export class CustomerRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<CustomerDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.customerTable == null) {
			throw Error('Table name customerTable can not be empty');
		}

		const defaultFilters: DynamoFilterElement[] = [
			{
				attribute: 'storeId',
				expression: DynamoFilterExpression.EQUAL,
				value: config.storeId
			}
		];

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			customerTableBuilder
				.setTableName(config.customerTable)
				.setDefaultFilters(defaultFilters)
				.build()
		);
	}

	public async getCustomerById(customerId: string): Promise<CustomerDto | null> {
		const dto = await this.repository.getByIndex({
			partitionKeyValue: customerId
		});
		return dto[0];
	}

	public async deleteCustomer(customer: CustomerDto): Promise<void> {
		this.checkCustomerStore(customer);
		await this.repository.batchDelete([{ partitionKey: customer.uuid }]);
	}

	public async getAllCustomers(): Promise<CustomerDto[]> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: this.config.storeId,
			indexName: CustomerSecondaryIndexNames.Store
		});
		return dtos;
	}

	public async getAllCustomersPaginated(
		lastCustomerPaginationKey?: Record<string, string | number>
	): Promise<IDynamoPaginatedResult<CustomerDto>> {
		return this.repository.getByIndexPaginated({
			indexName: CustomerSecondaryIndexNames.Store,
			partitionKeyValue: this.config.storeId,
			startKey: lastCustomerPaginationKey
		});
	}

	public async storeCustomers(customers: CustomerDto[]) {
		this.checkCustomerStore(customers);
		await this.repository.batchPut(customers);
	}

	public async getCustomerByPhone(phone: string): Promise<CustomerDto | null> {
		const dto = await this.repository.getByIndex({
			indexName: CustomerSecondaryIndexNames.Store,
			partitionKeyValue: this.config.storeId,
			sortQuery: {
				expression: DynamoQueryExpression.EQUAL,
				value: phone
			}
		});
		return dto[0] ?? null;
	}

	public async createCustomer(customer: CustomerDto) {
		this.checkCustomerStore(customer);
		if (!customer.uuid || !customer.name || !customer.phone || !customer.storeId) {
			throw new Error('Invalid customer data');
		}

		const currentCustomer = await this.getCustomerByPhone(customer.phone);
		if (currentCustomer !== null && currentCustomer.uuid !== customer.uuid) {
			throw new InvalidKeyError('There is already a customer with the same phone');
		}

		await this.repository.put(customer);
	}

	public async searchCustomer(normalizedQuery: string): Promise<CustomerDto[]> {
		const filterAttributes: DynamoFilterElement[] = [
			{
				attribute: 'normalizedName',
				expression: DynamoFilterExpression.CONTAINS,
				value: normalizedQuery
			}
		];

		return this.repository.getByIndex({
			indexName: CustomerSecondaryIndexNames.Store,
			partitionKeyValue: this.config.storeId,
			filters: filterAttributes
		});
	}

	private checkCustomerStore(dto: CustomerDto | CustomerDto[]) {
		if (Array.isArray(dto)) {
			dto.forEach((d) => {
				if (d.storeId !== this.config.storeId) {
					throw Error('Store id does not match');
				}
			});
		} else {
			if (dto.storeId !== this.config.storeId) {
				throw Error('Store id does not match');
			}
		}
	}
}
