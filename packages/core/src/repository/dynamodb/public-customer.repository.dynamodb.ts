import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { CustomerDto } from '../dto/customer.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import { customerTableBuilder } from './table/table.builders.dynamodb';

export class PublicCustomerRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<CustomerDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.customerTable == null) {
			throw Error('Table name customerTable can not be empty');
		}

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			customerTableBuilder.setTableName(config.customerTable).build()
		);
	}

	public async getCustomerById(customerId: string): Promise<CustomerDto | null> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: customerId
		});
		return dtos[0] ?? null;
	}
}
