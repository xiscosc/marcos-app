import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { CustomerDto } from '../dto/customer.dto';
import { DynamoRepository } from './dynamo.repository';
import { CustomerDynamoDbIndex } from './index.dynamodb';

export class PublicCustomerRepositoryDynamoDb extends DynamoRepository<CustomerDto> {
	constructor(config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.customerTable == null) {
			throw Error('Table name customerTable can not be empty');
		}
		super(config, config.customerTable, CustomerDynamoDbIndex.primaryIndex);
	}

	public async getCustomerById(customerId: string): Promise<CustomerDto | null> {
		const dtos = await this.getByIndex(this.primaryIndex, customerId);
		return dtos[0] ?? null;
	}
}
