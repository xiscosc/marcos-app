import { type AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocument,
	type DynamoDBDocumentClient,
	QueryCommand,
	ScanCommand,
	PutCommand,
	BatchWriteCommand,
	type UpdateCommandInput,
	UpdateCommand,
	type QueryCommandInput,
	TransactWriteCommand,
	type TransactWriteCommandInput,
	type NativeAttributeValue,
	ScanCommandInput
} from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import type { IPaginatedDtoResult } from '../dto/paginated-result.dto.interface';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../../configuration/core-configuration.interface';
import { getClientConfiguration } from '../../configuration/configuration.util';
import {
	DynamoDbIndexType,
	IPrimaryDynamoDbIndex,
	ISecondaryDynamoDbIndex
} from './index.dynamodb';
import { Logger } from 'pino';
import { getLogger } from '../../logger/logger';

export enum DynamoFilterExpressionWithValue {
	EQUAL = 'equal',
	NOT_EQUAL = 'not_equal',
	CONTAINS = 'contains'
}

export enum DynamoFilterExpressionWithoutValue {
	ATTRIBUTE_EXISTS = 'attribute_exists',
	ATTRIBUTE_NOT_EXISTS = 'attribute_not_exists'
}

export const DynamoFilterExpression = {
	...DynamoFilterExpressionWithValue,
	...DynamoFilterExpressionWithoutValue
} as const;

export type DynamoFilterExpression =
	(typeof DynamoFilterExpression)[keyof typeof DynamoFilterExpression];

export type DynamoFilterElement = {
	attribute: string;
	expression: DynamoFilterExpression;
	value: string | number | boolean;
};

export abstract class DynamoRepository<T> {
	protected readonly defaultLimit: number = 25;
	protected client: DynamoDBDocumentClient;
	private logger: Logger;

	protected constructor(
		config: ICoreConfiguration | ICoreConfigurationForAWSLambda,
		private readonly table: string,
		protected readonly primaryIndex: IPrimaryDynamoDbIndex,
		private defaultFilters: DynamoFilterElement[] = []
	) {
		this.logger = getLogger();
		if (!table) {
			throw new Error(`Invalid table or partition key name ${table}`);
		}

		try {
			this.client = DynamoDBDocument.from(new DynamoDBClient(getClientConfiguration(config)), {
				marshallOptions: { removeUndefinedValues: true }
			});
		} catch (error: unknown) {
			this.logError('constructor', error);
			throw error;
		}
	}

	protected async getByIndex(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string | number,
		includeSortKey: boolean = false,
		sortKeyValue?: string | number,
		descendent: boolean = true,
		filters: DynamoFilterElement[] = []
	): Promise<T[]> {
		const queryParams = this.buildQueryForIndex(
			index,
			partitionKeyValue,
			includeSortKey,
			sortKeyValue,
			descendent
		);

		const enrichedQueryParams = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filters, index),
			[],
			queryParams
		);

		try {
			return this.executeQueryCommandWithoutPagination(enrichedQueryParams);
		} catch (error: unknown) {
			this.logError('get', error);
			throw error;
		}
	}

	protected async getByIndexPaginated(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string | number,
		startKey?: Record<string, string | number>,
		descendent: boolean = true,
		filters: DynamoFilterElement[] = []
	): Promise<IPaginatedDtoResult<T>> {
		const queryParams = this.buildQueryForIndex(
			index,
			partitionKeyValue,
			false,
			undefined,
			descendent
		);

		const enrichedQueryParams = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filters, index),
			[],
			queryParams
		);

		try {
			return this.executeQueryCommandWithPagination(enrichedQueryParams, startKey);
		} catch (error: unknown) {
			this.logError('get paginated', error);
			throw error;
		}
	}

	protected async getBySortingKeyBetween(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string,
		sortKeyStartValue: string | number,
		sortKeyEndValue: string | number,
		descendent: boolean = true,
		filters: DynamoFilterElement[] = []
	): Promise<T[]> {
		if (index.sortKeyName == null) {
			return [];
		}

		const params = this.buildQueryForIndexAndSortRange(
			index,
			partitionKeyValue,
			sortKeyStartValue,
			sortKeyEndValue,
			descendent
		);

		const enrichedQueryParams = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filters, index),
			[],
			params
		);
		try {
			return this.executeQueryCommandWithoutPagination(enrichedQueryParams);
		} catch (error: unknown) {
			this.logError('getBySortingKeyBetween', error);
			throw error;
		}
	}

	protected scan(
		filterAttributes: DynamoFilterElement[],
		limit?: number,
		index?: ISecondaryDynamoDbIndex,
		startKey?: Record<string, string | number>
	): Promise<IPaginatedDtoResult<T>>;
	protected scan(
		filterAttributes: DynamoFilterElement[],
		limit?: number,
		index?: ISecondaryDynamoDbIndex,
		startKey?: Record<string, string | number>,
		projectionAttributes?: string[]
	): Promise<IPaginatedDtoResult<Partial<T>>>;
	protected async scan(
		filterAttributes: DynamoFilterElement[],
		limit?: number,
		index?: ISecondaryDynamoDbIndex,
		startKey?: Record<string, string | number>,
		projectionAttributes?: string[]
	): Promise<IPaginatedDtoResult<T | Partial<T>>> {
		const elements: Partial<T>[] = [];
		const request: ScanCommandInput = {
			TableName: this.table,
			Limit: limit,
			IndexName: index?.indexName,
			ExclusiveStartKey: startKey
		};

		const enrichedRequest = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filterAttributes, index),
			projectionAttributes ?? [],
			request
		);

		try {
			const response = await this.client.send(new ScanCommand(enrichedRequest));
			if (response.Items) {
				elements.push(...(response.Items as Partial<T>[]));
			}

			return {
				elements,
				endKey: response.LastEvaluatedKey
			};
		} catch (error: unknown) {
			this.logError('scan', error);
			throw error;
		}
	}

	protected async updateFields(
		partitionKeyValue: string,
		fieldMap: Map<string, string | number | boolean | undefined>,
		sortKeyValue?: string | number
	) {
		const key: { [x: string]: string | number } = {
			[this.primaryIndex.partitionKeyName]: partitionKeyValue
		};

		const keys = [...fieldMap.keys()];

		if (
			keys.includes(this.primaryIndex.partitionKeyName) ||
			keys.includes(this.primaryIndex.sortKeyName ?? '')
		) {
			throw Error('PK or SK can not be modified');
		}

		if (this.primaryIndex.sortKeyName && !sortKeyValue) {
			throw Error("Sort key value can't be null");
		}

		if (this.primaryIndex.sortKeyName && sortKeyValue) {
			key[this.primaryIndex.sortKeyName] = sortKeyValue;
		}

		const updateExpressionParts: string[] = [];
		const expressionAttributeNames: { [key: string]: string } = {};
		const expressionAttributeValues: {
			[key: string]: string | number | boolean | undefined;
		} = {};

		let index = 1;

		for (const [key, value] of fieldMap) {
			const fieldPlaceholder = `#field${index}`;
			const valuePlaceholder = `:value${index}`;

			// Add to the update expression
			updateExpressionParts.push(`${fieldPlaceholder} = ${valuePlaceholder}`);

			// Add to the expression attribute names and values
			expressionAttributeNames[fieldPlaceholder] = key;
			expressionAttributeValues[valuePlaceholder] = value;

			index++;
		}

		const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

		const params: UpdateCommandInput = {
			TableName: this.table,
			Key: key,
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: expressionAttributeValues
		};

		try {
			await this.client.send(new UpdateCommand(params));
		} catch (error: unknown) {
			this.logError('updateField', error);
			throw error;
		}
	}

	protected async put(dto: T) {
		const input = {
			TableName: this.table,
			Item: dto as Record<string, AttributeValue>
		};

		try {
			await this.client.send(new PutCommand(input));
		} catch (error: unknown) {
			this.logError('put', error);
			throw error;
		}
	}

	protected async updateFullObject(oldDto: T, newDto: T) {
		const deleteParams = {
			TableName: this.table,
			Key: this.extractKeyFromDto(oldDto)
		};

		const putParams = {
			TableName: this.table,
			Item: newDto as Record<string, AttributeValue>
		};

		const params: TransactWriteCommandInput = {
			TransactItems: [
				{
					Delete: deleteParams
				},
				{
					Put: putParams
				}
			]
		};

		try {
			await this.client.send(new TransactWriteCommand(params));
		} catch (error) {
			this.logError('full update', error);
			throw error;
		}
	}

	protected async batchPut(dtoList: T[]) {
		const putRequests = dtoList.map((dto) => ({
			PutRequest: {
				Item: dto as Record<string, AttributeValue>
			}
		}));

		const chunkedRequests = _.chunk(putRequests, 25);
		try {
			for (const chunk of chunkedRequests) {
				await this.batchWrite(chunk);
			}
		} catch (error: unknown) {
			this.logError('batchPut', error);
			throw error;
		}
	}

	protected async batchDelete(values: { partitionKey: string; sortKey?: string | number }[]) {
		const deleteRequests = values.map((value) => {
			const key: {
				[x: string]: string | number;
			} = {
				[this.primaryIndex.partitionKeyName]: value.partitionKey
			};

			if (this.primaryIndex.sortKeyName && !value.sortKey) {
				throw Error("Sort key value can't be null");
			}

			if (this.primaryIndex.sortKeyName && value.sortKey) {
				key[this.primaryIndex.sortKeyName] = value.sortKey;
			}

			return {
				DeleteRequest: {
					Key: key
				}
			};
		});

		const chunkedRequests = _.chunk(deleteRequests, 25);
		try {
			for (const chunk of chunkedRequests) {
				await this.batchWrite(chunk);
			}
		} catch (error: unknown) {
			this.logError('batchDelete', error);
			throw error;
		}
	}

	private async executeQueryCommandWithoutPagination(params: QueryCommandInput): Promise<T[]> {
		const results: T[] = [];
		let lastEvaluatedKey: Record<string, NativeAttributeValue> | undefined;

		try {
			do {
				if (lastEvaluatedKey) {
					params.ExclusiveStartKey = lastEvaluatedKey;
				}

				const command = new QueryCommand(params);
				const response = await this.client.send(command);

				if (response.Items) {
					results.push(...(response.Items as T[]));
				}

				lastEvaluatedKey = response.LastEvaluatedKey;
			} while (lastEvaluatedKey);
		} catch (error: unknown) {
			this.logError('execute query command', error);
			throw error;
		}

		return results;
	}

	private async executeQueryCommandWithPagination(
		params: QueryCommandInput,
		startKey?: Record<string, string | number>
	): Promise<IPaginatedDtoResult<T>> {
		try {
			params.ExclusiveStartKey = startKey;
			params.Limit = this.defaultLimit;
			const command = new QueryCommand(params);
			const response = await this.client.send(command);

			return {
				elements: response.Items as T[],
				endKey: response.LastEvaluatedKey
			};
		} catch (error: unknown) {
			this.logError('execute paginated query command', error);
			throw error;
		}
	}

	private async batchWrite(
		requests:
			| { PutRequest: { Item: Record<string, AttributeValue> } }[]
			| { DeleteRequest: { Key: { [x: string]: string | number } } }[]
	) {
		const params = {
			RequestItems: {
				[this.table]: requests
			}
		};

		try {
			await this.client.send(new BatchWriteCommand(params));
		} catch (error: unknown) {
			this.logError('batchWrite', error);
			throw error;
		}
	}

	private logError(functionName: string, error: unknown, otherInfo?: object) {
		this.logger.error(
			`Error repo ${this.table}, partitionKey ${this.primaryIndex.partitionKeyName}, sortkey ${
				this.primaryIndex.sortKeyName
			}, and function ${functionName}: ${(error as Error).toString()}`
		);

		if (otherInfo) {
			this.logger.error(JSON.stringify(otherInfo));
		}
	}

	private extractKeyFromDto(dto: T): { [x: string]: string | number } {
		const key = {
			[this.primaryIndex.partitionKeyName]: (dto as { [key: string]: string | number })[
				this.primaryIndex.partitionKeyName
			] as string | number
		};

		if (this.primaryIndex.sortKeyName) {
			key[this.primaryIndex.sortKeyName] = (dto as { [key: string]: string | number })[
				this.primaryIndex.sortKeyName
			] as string | number;

			if (key[this.primaryIndex.sortKeyName] == null) {
				throw Error('Sort key not found');
			}
		}

		return key;
	}

	private buildQueryForIndex(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string | number,
		includeSortKey: boolean = false,
		sortKeyValue?: string | number,
		descendent: boolean = true
	): QueryCommandInput {
		if (!includeSortKey) {
			return {
				IndexName: index.type === DynamoDbIndexType.secondary ? index.indexName : undefined,
				TableName: this.table,
				KeyConditionExpression: '#pk = :pkv',
				ExpressionAttributeNames: {
					'#pk': index.partitionKeyName
				},
				ExpressionAttributeValues: {
					':pkv': partitionKeyValue
				},
				ScanIndexForward: !descendent
			};
		} else {
			if (index.sortKeyName == null || sortKeyValue == null) {
				throw Error(
					`Sort key names | values are not compatible  ${index.sortKeyName} | ${sortKeyValue}`
				);
			}
			return {
				IndexName: index.type === DynamoDbIndexType.secondary ? index.indexName : undefined,
				TableName: this.table,
				KeyConditionExpression: '#pk = :pkv AND #sk = :skv',
				ExpressionAttributeNames: {
					'#pk': index.partitionKeyName,
					'#sk': index.sortKeyName
				},
				ExpressionAttributeValues: {
					':pkv': partitionKeyValue,
					':skv': sortKeyValue
				},
				ScanIndexForward: !descendent
			};
		}
	}

	private buildQueryForIndexAndSortRange(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string | number,
		sortKeyValueStartValue: string | number,
		sortKeyEndValue: string | number,
		descendent: boolean = true
	): QueryCommandInput {
		if (index.sortKeyName == null) {
			throw Error(`Sort key is required`);
		}
		return {
			IndexName: index.type === DynamoDbIndexType.secondary ? index.indexName : undefined,
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv AND #sk BETWEEN :sksv AND :skev',
			ExpressionAttributeNames: {
				'#pk': index.partitionKeyName,
				'#sk': index.sortKeyName
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue,
				':sksv': sortKeyValueStartValue,
				':skev': sortKeyEndValue
			},
			ScanIndexForward: !descendent
		};
	}

	private combineAndCleanWithDefultFilterElements(
		filterElements: DynamoFilterElement[],
		usedIndex?: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex
	): DynamoFilterElement[] {
		const uniqueElements = new Map<string, DynamoFilterElement>();

		for (const element of [...this.defaultFilters, ...filterElements]) {
			const key = `${element.attribute}-${element.expression}-${element.value}`;
			uniqueElements.set(key, element);
		}

		const combinedFilters = Array.from(uniqueElements.values());

		return usedIndex
			? combinedFilters.filter((filter) => filter.attribute !== usedIndex.partitionKeyName)
			: combinedFilters;
	}

	private addFilterAndProjectionExpressions(
		attributes: DynamoFilterElement[],
		projectionAttributes: string[],
		input: ScanCommandInput
	): ScanCommandInput;
	private addFilterAndProjectionExpressions(
		attributes: DynamoFilterElement[],
		projectionAttributes: string[],
		input: QueryCommandInput
	): QueryCommandInput {
		if (attributes.length === 0 && projectionAttributes.length === 0) {
			return input;
		}

		const attributesMap = new Map<string, DynamoFilterElement>(
			attributes.map((attribute) => [attribute.attribute, attribute])
		);
		const attributesNamesMap = new Map<string, string>();
		const attributesValueNamesMap = new Map<string, string>();

		attributes.forEach((attribute, index) => {
			attributesNamesMap.set(
				attribute.attribute,
				DynamoRepository.generateAttributeName(attribute.attribute, index)
			);

			if (DynamoRepository.canAttributeHaveValue(attribute.expression)) {
				attributesValueNamesMap.set(attribute.attribute, `:attrValue${index}`);
			}
		});

		projectionAttributes.forEach((attribute, index) => {
			attributesNamesMap.set(attribute, `#attrp${index}`);
		});

		input.ExpressionAttributeNames = {
			...(input.ExpressionAttributeNames ?? {}),
			...DynamoRepository.genetrateAttributeNamesRecord(attributesNamesMap)
		};

		if (projectionAttributes.length > 0) {
			input.ProjectionExpression = projectionAttributes
				.map((attribute) => attributesNamesMap.get(attribute)!)
				.join(', ');
		}

		if (attributes.length > 0) {
			input.FilterExpression = attributes
				.map((attribute) =>
					DynamoRepository.generateExpression(
						attribute.expression,
						attributesNamesMap.get(attribute.attribute)!,
						attributesValueNamesMap.get(attribute.attribute)
					)
				)
				.join(' AND ');

			input.ExpressionAttributeValues = {
				...(input.ExpressionAttributeValues ?? {}),
				...Object.fromEntries(
					[...attributesValueNamesMap.entries()].map(([key, value]) => [
						value,
						attributesMap.get(key)!.value
					])
				)
			};
		}

		return input;
	}

	private static canAttributeHaveValue(expression: DynamoFilterExpression): boolean {
		const valueExpressions = Object.values(DynamoFilterExpressionWithValue);
		return valueExpressions.includes(expression as DynamoFilterExpressionWithValue);
	}

	private static generateAttributeName(attribute: string, index: number): string {
		if (attribute.includes('.')) {
			const parts = attribute.split('.');
			return parts.map((_, i) => `#attr${index}_${i}`).join('.');
		} else {
			return `#attr${index}`;
		}
	}

	private static genetrateAttributeNamesRecord(
		attributesMap: Map<string, string>
	): Record<string, string> {
		const result: { [key: string]: string } = {};
		attributesMap.forEach((value, key) => {
			if (value.includes('.')) {
				const valueParts = value.split('.');
				const keyParts = key.split('.');
				valueParts.forEach((valuePart, i) => {
					result[valuePart] = keyParts[i];
				});
			} else {
				result[value] = key;
			}
		});
		return result;
	}

	private static generateExpression(
		expression: DynamoFilterExpression,
		variableName: string,
		valueName?: string
	): string {
		if (DynamoRepository.canAttributeHaveValue(expression) && valueName == null) {
			throw new Error(`Variable value is required for expression: ${expression}`);
		}

		switch (expression) {
			case DynamoFilterExpression.ATTRIBUTE_EXISTS:
				return `attribute_exists(${variableName})`;
			case DynamoFilterExpression.ATTRIBUTE_NOT_EXISTS:
				return `attribute_not_exists(${variableName})`;
			case DynamoFilterExpression.CONTAINS:
				return `contains(${variableName}, ${valueName})`;
			case DynamoFilterExpression.EQUAL:
				return `${variableName} = ${valueName}`;
			case DynamoFilterExpression.NOT_EQUAL:
				return `${variableName} <> ${valueName}`;
			default:
				throw new Error(`Unsupported expression: ${expression}`);
		}
	}
}
