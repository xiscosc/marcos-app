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
import type { IDynamoPaginatedResult } from '../type/result.dynamodb.type';
import {
	DynamoDbIndexType,
	IPrimaryDynamoDbIndex,
	ISecondaryDynamoDbIndex
} from '../type/index.dynamodb.type';
import pino, { Logger } from 'pino';
import {
	DynamoFilterElement,
	DynamoFilterExpression,
	DynamoFilterExpressionWithValue,
	DynamoQueryExpression,
	DynamoSortQueryElement
} from '../type/filter.dynamodb.type';
import { BalerialDynamoTable } from '../table/table.dynamodb';
import { AwsCredentialIdentity } from '@smithy/types';
import {
	DynamoGetRequest,
	DynamoGetRequestPaginated,
	DynamoScanRequest
} from '../type/request.dynamodb.type';
export class BalerialDynamoRepository<T> {
	private readonly defaultLimit: number = 25;
	private client: DynamoDBDocumentClient;
	private logger: Logger;

	constructor(
		config: { region?: string; credentials?: AwsCredentialIdentity },
		private readonly table: BalerialDynamoTable
	) {
		this.logger = pino();

		try {
			this.client = DynamoDBDocument.from(new DynamoDBClient(config), {
				marshallOptions: { removeUndefinedValues: true }
			});
		} catch (error: unknown) {
			this.logError('constructor', error);
			throw error;
		}
	}

	async getByIndex({
		indexName,
		partitionKeyValue,
		sortQuery,
		descendent,
		filters
	}: DynamoGetRequest): Promise<T[]> {
		const index = indexName
			? this.table.getSecondaryIndex(indexName)
			: this.table.getPrimaryIndex();
		const queryParams = this.buildQueryForIndex(index, partitionKeyValue, sortQuery, descendent);

		const enrichedQueryParams = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filters ?? [], index),
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

	async getByIndexPaginated({
		indexName,
		partitionKeyValue,
		startKey,
		sortQuery,
		descendent,
		filters
	}: DynamoGetRequestPaginated): Promise<IDynamoPaginatedResult<T>> {
		const index = indexName
			? this.table.getSecondaryIndex(indexName)
			: this.table.getPrimaryIndex();
		const queryParams = this.buildQueryForIndex(index, partitionKeyValue, sortQuery, descendent);

		const enrichedQueryParams = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filters ?? [], index),
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

	async scan({
		filterAttributes,
		limit,
		indexName,
		startKey,
		projectionAttributes
	}: DynamoScanRequest): Promise<IDynamoPaginatedResult<T | Partial<T>>> {
		const elements: Partial<T>[] = [];
		const index = indexName ? this.table.getSecondaryIndex(indexName) : undefined;
		const request: ScanCommandInput = {
			TableName: this.table.getTableName(),
			Limit: limit,
			IndexName: index?.indexName,
			ExclusiveStartKey: startKey
		};

		const enrichedRequest = this.addFilterAndProjectionExpressions(
			this.combineAndCleanWithDefultFilterElements(filterAttributes ?? [], index),
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

	async updateFields(
		partitionKeyValue: string,
		fieldMap: Map<string, string | number | boolean | undefined>,
		sortKeyValue?: string | number
	) {
		const key: { [x: string]: string | number } = {
			[this.table.getPrimaryIndex().partitionKeyName]: partitionKeyValue
		};

		const keys = [...fieldMap.keys()];

		if (
			keys.includes(this.table.getPrimaryIndex().partitionKeyName) ||
			keys.includes(this.table.getPrimaryIndex().sortKeyName ?? '')
		) {
			throw Error('PK or SK can not be modified');
		}

		const sortKeyName = this.table.getPrimaryIndex().sortKeyName;
		if (sortKeyName && !sortKeyValue) {
			throw Error("Sort key value can't be null");
		}

		if (sortKeyName && sortKeyValue) {
			key[sortKeyName] = sortKeyValue;
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
			TableName: this.table.getTableName(),
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

	async put(dto: T) {
		const input = {
			TableName: this.table.getTableName(),
			Item: dto as Record<string, AttributeValue>
		};

		try {
			await this.client.send(new PutCommand(input));
		} catch (error: unknown) {
			this.logError('put', error);
			throw error;
		}
	}

	async updateFullObject(oldDto: T, newDto: T) {
		const deleteParams = {
			TableName: this.table.getTableName(),
			Key: this.extractKeyFromDto(oldDto)
		};

		const putParams = {
			TableName: this.table.getTableName(),
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

	async batchPut(dtoList: T[]) {
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

	async batchDelete(values: { partitionKey: string; sortKey?: string | number }[]) {
		const deleteRequests = values.map((value) => {
			const key: {
				[x: string]: string | number;
			} = {
				[this.table.getPrimaryIndex().partitionKeyName]: value.partitionKey
			};

			const sortKeyName = this.table.getPrimaryIndex().sortKeyName;
			if (sortKeyName && !value.sortKey) {
				throw Error("Sort key value can't be null");
			}

			if (sortKeyName && value.sortKey) {
				key[sortKeyName] = value.sortKey;
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
	): Promise<IDynamoPaginatedResult<T>> {
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
				[this.table.getTableName()]: requests
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
			`Error repo ${this.table.getTableName()}, partitionKey ${this.table.getPrimaryIndex().partitionKeyName}, sortkey ${
				this.table.getPrimaryIndex().sortKeyName
			}, and function ${functionName}: ${(error as Error).toString()}`
		);

		if (otherInfo) {
			this.logger.error(JSON.stringify(otherInfo));
		}
	}

	private extractKeyFromDto(dto: T): { [x: string]: string | number } {
		const key = {
			[this.table.getPrimaryIndex().partitionKeyName]: (dto as { [key: string]: string | number })[
				this.table.getPrimaryIndex().partitionKeyName
			] as string | number
		};

		const sortKeyName = this.table.getPrimaryIndex().sortKeyName;
		if (sortKeyName) {
			key[sortKeyName] = (dto as { [key: string]: string | number })[sortKeyName] as
				| string
				| number;

			if (key[sortKeyName] == null) {
				throw Error('Sort key not found');
			}
		}

		return key;
	}

	private buildQueryForIndex(
		index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
		partitionKeyValue: string | number,
		sortQuery?: DynamoSortQueryElement,
		descendent: boolean = true
	): QueryCommandInput {
		if (sortQuery == null) {
			return {
				IndexName: index.type === DynamoDbIndexType.secondary ? index.indexName : undefined,
				TableName: this.table.getTableName(),
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
			if (index.sortKeyName == null) {
				throw Error(
					`Sort key names | values are not compatible  ${index.sortKeyName} | ${sortQuery.value}`
				);
			}

			let sortKeyCondition = '';
			let sortKeyValues = {};
			if (sortQuery.expression === DynamoQueryExpression.BETWEEN) {
				if (typeof sortQuery.value !== 'object' || !sortQuery.value.start || !sortQuery.value.end) {
					throw Error('Sort query value must be an object with start and end properties');
				}
				sortKeyCondition = '#sk BETWEEN :skv1 AND :skv2';
				sortKeyValues = {
					':skv1': sortQuery.value.start,
					':skv2': sortQuery.value.end
				};
			} else if (sortQuery.expression === DynamoQueryExpression.EQUAL) {
				sortKeyCondition = '#sk = :skv';
				sortKeyValues = {
					':skv': sortQuery.value
				};
			} else {
				throw Error(`Unsupported sort query expression: ${sortQuery.expression}`);
			}

			return {
				IndexName: index.type === DynamoDbIndexType.secondary ? index.indexName : undefined,
				TableName: this.table.getTableName(),
				KeyConditionExpression: '#pk = :pkv AND ' + sortKeyCondition,
				ExpressionAttributeNames: {
					'#pk': index.partitionKeyName,
					'#sk': index.sortKeyName
				},
				ExpressionAttributeValues: {
					':pkv': partitionKeyValue,
					...sortKeyValues
				},
				ScanIndexForward: !descendent
			};
		}
	}

	private combineAndCleanWithDefultFilterElements(
		filterElements: DynamoFilterElement[],
		usedIndex?: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex
	): DynamoFilterElement[] {
		const uniqueElements = new Map<string, DynamoFilterElement>();

		for (const element of [...this.table.getDefaultFilters(), ...filterElements]) {
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
				BalerialDynamoRepository.generateAttributeName(attribute.attribute, index)
			);

			if (BalerialDynamoRepository.canAttributeHaveValue(attribute.expression)) {
				attributesValueNamesMap.set(attribute.attribute, `:attrValue${index}`);
			}
		});

		projectionAttributes.forEach((attribute, index) => {
			attributesNamesMap.set(attribute, `#attrp${index}`);
		});

		input.ExpressionAttributeNames = {
			...(input.ExpressionAttributeNames ?? {}),
			...BalerialDynamoRepository.genetrateAttributeNamesRecord(attributesNamesMap)
		};

		if (projectionAttributes.length > 0) {
			input.ProjectionExpression = projectionAttributes
				.map((attribute) => attributesNamesMap.get(attribute)!)
				.join(', ');
		}

		if (attributes.length > 0) {
			input.FilterExpression = attributes
				.map((attribute) =>
					BalerialDynamoRepository.generateExpression(
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
		if (BalerialDynamoRepository.canAttributeHaveValue(expression) && valueName == null) {
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
