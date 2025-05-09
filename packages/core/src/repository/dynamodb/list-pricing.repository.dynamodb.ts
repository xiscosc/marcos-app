import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { InvalidKeyError } from '../../error/invalid-key.error';
import type { ListPriceDto } from '../dto/list-price.dto';
import { BalerialDynamoRepository } from '@balerial/dynamo/repository';
import { getClientConfiguration } from '../../configuration/configuration.util';
import {
	listPricingTableBuilder,
	ListPricingSecondaryIndexNames
} from './table/table.builders.dynamodb';
import { DynamoQueryExpression } from '@balerial/dynamo/type';
export class ListPricingRepositoryDynamoDb {
	private repository: BalerialDynamoRepository<ListPriceDto>;

	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		if (config.listPricingTable == null) {
			throw Error('Table name listPricingTable can not be empty');
		}

		this.repository = new BalerialDynamoRepository(
			getClientConfiguration(config),
			listPricingTableBuilder.setTableName(config.listPricingTable).build()
		);
	}

	public async getByTypeAndId(type: string, id: string): Promise<ListPriceDto | null> {
		const dtos = await this.repository.getByIndex({
			indexName: ListPricingSecondaryIndexNames.Type,
			partitionKeyValue: type,
			sortQuery: {
				expression: DynamoQueryExpression.EQUAL,
				value: id
			}
		});
		return dtos[0] ?? null;
	}

	public async getByInternalId(uuid: string): Promise<ListPriceDto | null> {
		const dtos = await this.repository.getByIndex({
			partitionKeyValue: uuid
		});
		return dtos[0] ?? null;
	}

	public async storeListPrice(price: ListPriceDto): Promise<void> {
		const currentPrice = await this.getByTypeAndId(price.type, price.id);
		if (currentPrice != null && currentPrice.uuid !== price.uuid) {
			throw new InvalidKeyError('There is already a price with that id');
		}
		await this.repository.put(price);
	}

	public async batchStoreListPrices(type: string, newPrices: ListPriceDto[]): Promise<void> {
		if (newPrices.length === 0) {
			return;
		}

		const currentPrices = await this.getAllPricesByType(type);
		const idMap = new Map(currentPrices.map((price) => [price.id, price.uuid]));
		const pricesToCreate: ListPriceDto[] = [];

		newPrices.forEach((price) => {
			if (idMap.get(price.id) != null) {
				throw new InvalidKeyError('There is already a price with that id');
			}

			pricesToCreate.push(price);
		});

		await this.repository.batchPut(pricesToCreate);
	}

	public async getAllPricesByType(type: string): Promise<ListPriceDto[]> {
		return this.repository.getByIndex({
			indexName: ListPricingSecondaryIndexNames.Type,
			partitionKeyValue: type
		});
	}

	public async deleteListPrices(uuids: string[]): Promise<void> {
		const params = uuids.map((uuid) => ({ partitionKey: uuid }));
		if (params.length > 0) {
			await this.repository.batchDelete(params);
		}
	}
}
