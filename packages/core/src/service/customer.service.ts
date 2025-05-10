import { v4 as uuidv4 } from 'uuid';

import { InvalidDataError } from '../error/invalid-data.error';
import { CustomerRepositoryDynamoDb } from '../repository/dynamodb/customer.repository.dynamodb';
import type { CustomerDto } from '../repository/dto/customer.dto';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { Customer } from '../types/customer.type';
import { SearchUtilities } from '../utilities/search.utilities';

interface PaginatedCustomers {
	customers: Customer[];
	nextKey?: Record<string, string | number>;
}

export class CustomerService {
	private repository: CustomerRepositoryDynamoDb;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		this.repository = new CustomerRepositoryDynamoDb(config);
	}

	public async getCustomerById(customerId: string): Promise<Customer | null> {
		const customerDto = await this.repository.getCustomerById(customerId);
		if (customerDto) {
			return CustomerService.fromDto(customerDto);
		}

		return null;
	}

	public async deleteCustomerById(customerId: string) {
		const customerDto = await this.repository.getCustomerById(customerId);
		if (customerDto) {
			await this.repository.deleteCustomer(customerDto);
		}
	}

	public async getAllCustomersMap(filterIds: string[]): Promise<Map<string, Customer>> {
		const map = new Map<string, Customer>();
		const filterSet = new Set<string>(filterIds ?? []);

		const dtos = (
			await Promise.all([...filterSet].map((id) => this.repository.getCustomerById(id)))
		).filter((customer) => customer != null);

		dtos.forEach((dto) => {
			if (filterIds == null || filterSet.has(dto.uuid)) {
				const customer = CustomerService.fromDto(dto);
				map.set(customer.id, customer);
			}
		});

		return map;
	}

	public async getAllCustomersPaginated(
		nextKey?: Record<string, string | number>
	): Promise<PaginatedCustomers> {
		const paginatedDtos = await this.repository.getAllCustomersPaginated(nextKey);

		return {
			customers: paginatedDtos.elements.map((dto) => CustomerService.fromDto(dto)),
			nextKey: paginatedDtos.endKey
		};
	}

	public async indexCustomers() {
		const customerDtos = await this.repository.getAllCustomers();
		const newDtos = customerDtos
			.map((dto) => CustomerService.fromDto(dto))
			.map((c) => CustomerService.toDto(c));
		await this.repository.storeCustomers(newDtos);
	}

	public async searchCustomers(query: string): Promise<Customer[]> {
		const dtos = await this.repository.searchCustomer(SearchUtilities.normalizeString(query));

		return dtos.map((dto) => CustomerService.fromDto(dto));
	}

	public async updateCustomerData(
		customer: Customer,
		name?: string,
		phone?: string
	): Promise<Customer> {
		customer.name = name ?? customer.name;
		customer.phone = phone ?? customer.phone;
		CustomerService.validate(customer);
		const newCustomerDto = CustomerService.toDto(customer);
		await this.repository.createCustomer(newCustomerDto);
		return customer;
	}

	public async getCustomerByPhone(phone: string): Promise<Customer | null> {
		const dto = await this.repository.getCustomerByPhone(phone);
		return dto ? CustomerService.fromDto(dto) : null;
	}

	public async createCustomer(name: string, phone: string): Promise<Customer> {
		const customer = {
			id: uuidv4(),
			name,
			storeId: this.config.storeId,
			phone
		};

		CustomerService.validate(customer);
		await this.repository.createCustomer(CustomerService.toDto(customer));
		return customer;
	}

	public static fromDto(dto: CustomerDto): Customer {
		return {
			id: dto.uuid,
			name: dto.name,
			phone: dto.phone,
			storeId: dto.storeId
		};
	}

	private static validate(customer: Customer) {
		if (!customer.name || !customer.phone || customer.name === '' || customer.phone === '') {
			throw new InvalidDataError('Invalid name and/or phone');
		}

		// Validate phone format
		const phoneRegex = /^\+\d{1,3}\d{9,15}$/;
		if (!phoneRegex.test(customer.phone)) {
			throw new InvalidDataError('Invalid phone format');
		}
	}

	private static toDto(customer: Customer): CustomerDto {
		return {
			uuid: customer.id,
			name: customer.name,
			phone: customer.phone,
			storeId: customer.storeId,
			normalizedName: SearchUtilities.normalizeString(customer.name)
		};
	}
}
