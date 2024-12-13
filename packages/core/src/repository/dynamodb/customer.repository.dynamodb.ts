import {
  ICoreConfiguration,
  ICoreConfigurationForAWSLambda,
  ICorePublicConfiguration,
  ICorePublicConfigurationForAWSLambda,
  PUBLIC_REPOSITORY,
} from "../../configuration/core-configuration.interface";
import { InvalidKeyError } from "../../error/invalid-key.error";
import type { CustomerDto } from "../dto/customer.dto";
import type { IPaginatedDtoResult } from "../dto/paginated-result.dto.interface";
import { DynamoRepository } from "./dynamo.repository";
import { CustomerDynamoDbIndex } from "./index.dynamodb";

export class CustomerRepositoryDynamoDb extends DynamoRepository<CustomerDto> {
  constructor(
    private readonly config:
      | ICoreConfiguration
      | ICoreConfigurationForAWSLambda,
  ) {
    if (config.customerTable == null) {
      throw Error("Table name customerTable can not be empty");
    }
    super(config, config.customerTable, CustomerDynamoDbIndex.primaryIndex);
  }

  public async getCustomerById(
    customerId: string,
  ): Promise<CustomerDto | null> {
    const dto = await this.getByIndex(this.primaryIndex, customerId);
    return this.filterByStoreId(dto[0]) as CustomerDto | null;
  }

  public async getPublicCustomerById(
    customerId: string,
  ): Promise<CustomerDto | null> {
    const dto = await this.getByIndex(this.primaryIndex, customerId);
    return this.config.storeId === PUBLIC_REPOSITORY ? dto[0] : null;
  }

  public async deleteCustomer(customer: CustomerDto): Promise<void> {
    this.checkCustomerStore(customer);
    await this.batchDelete([{ partitionKey: customer.uuid }]);
  }

  public async getAllCustomers(): Promise<CustomerDto[]> {
    const dtos = await this.getByIndex(
      CustomerDynamoDbIndex.storeIndex,
      this.config.storeId,
    );
    return dtos;
  }

  public async getAllCustomersPaginated(
    lastCustomerPaginationKey?: Record<string, string | number>,
  ): Promise<IPaginatedDtoResult<CustomerDto>> {
    return this.getByIndexPaginated(
      CustomerDynamoDbIndex.storeIndex,
      this.config.storeId,
      lastCustomerPaginationKey,
    );
  }

  public async storeCustomers(customers: CustomerDto[]) {
    this.checkCustomerStore(customers);
    await this.batchPut(customers);
  }

  public async getCustomerByPhone(phone: string): Promise<CustomerDto | null> {
    const dto = await await this.getByIndex(
      CustomerDynamoDbIndex.storeIndex,
      this.config.storeId,
      true,
      phone,
    );
    return dto[0] ?? null;
  }

  public async createCustomer(customer: CustomerDto) {
    this.checkCustomerStore(customer);
    if (
      !customer.uuid ||
      !customer.name ||
      !customer.phone ||
      !customer.storeId
    ) {
      throw new Error("Invalid customer data");
    }

    const currentCustomer = await this.getCustomerByPhone(customer.phone);
    if (currentCustomer !== null && currentCustomer.uuid !== customer.uuid) {
      throw new InvalidKeyError(
        "There is already a customer with the same phone",
      );
    }

    await this.put(customer);
  }

  public async searchCustomer(normalizedQuery: string): Promise<CustomerDto[]> {
    return this.search(
      CustomerDynamoDbIndex.storeIndex,
      this.config.storeId,
      normalizedQuery,
      "normalizedName",
    );
  }

  public static createPublicRepository(
    publicConfig:
      | ICorePublicConfiguration
      | ICorePublicConfigurationForAWSLambda,
  ): CustomerRepositoryDynamoDb {
    return new CustomerRepositoryDynamoDb(publicConfig);
  }

  private filterByStoreId(
    dto: CustomerDto | CustomerDto[] | undefined | null,
  ): null | CustomerDto | CustomerDto[] {
    if (dto == null) {
      return null;
    }

    if (Array.isArray(dto)) {
      return dto.filter((d) => d.storeId === this.config.storeId);
    }

    return dto.storeId === this.config.storeId ? dto : null;
  }

  private checkCustomerStore(dto: CustomerDto | CustomerDto[]) {
    if (Array.isArray(dto)) {
      dto.forEach((d) => {
        if (d.storeId !== this.config.storeId) {
          throw Error("Store id does not match");
        }
      });
    } else {
      if (dto.storeId !== this.config.storeId) {
        throw Error("Store id does not match");
      }
    }
  }
}
