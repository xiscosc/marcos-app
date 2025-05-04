import {
	DynamoDBDocument,
	DynamoDBDocumentClient,
	QueryCommandInput,
	ScanCommandInput
} from '@aws-sdk/lib-dynamodb';
import { AwsCredentialIdentity } from '@smithy/types';
import { IPrimaryDynamoDbIndex, ISecondaryDynamoDbIndex } from '../index/index.interface';
import {
	BalerialDynamoQueryRequest,
	BalerialDynamoRequest,
	BalerialDynamoScanRequest,
	DynamoFilterElement,
	DynamoFilterExpression,
	DynamoFilterExpressionWithValue
} from './request.type';
import { Logger } from 'pino';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { IPaginatedDtoResult } from './resut.type';

export class BalerialDynamoRepository<T> {
	protected client: DynamoDBDocumentClient;

	constructor(
		private readonly table: string,
		protected readonly primaryIndex: IPrimaryDynamoDbIndex,
		private readonly logger: Logger,
		private defaultFilters: DynamoFilterElement[] = [],
		awsRegion?: string,
		awsCredentials?: AwsCredentialIdentity
	) {
		if (!table) {
			this.logError(`Invalid table or partition key name ${table}`);
			throw new Error(`Invalid table or partition key name ${table}`);
		}

		try {
			this.client = DynamoDBDocument.from(
				new DynamoDBClient({
					region: awsRegion,
					credentials: awsCredentials
				}),
				{
					marshallOptions: { removeUndefinedValues: true }
				}
			);
		} catch (error: unknown) {
			this.logError('Problems initializing', error);
			throw error;
		}
	}

	public async runRequest(
		request: BalerialDynamoQueryRequest | BalerialDynamoScanRequest
	): Promise<IPaginatedDtoResult<T>> {}

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
				this.generateAttributeName(attribute.attribute, index)
			);

			if (this.canAttributeHaveValue(attribute.expression)) {
				attributesValueNamesMap.set(attribute.attribute, `:attrValue${index}`);
			}
		});

		projectionAttributes.forEach((attribute, index) => {
			attributesNamesMap.set(attribute, `#attrp${index}`);
		});

		input.ExpressionAttributeNames = {
			...(input.ExpressionAttributeNames ?? {}),
			...this.genetrateAttributeNamesRecord(attributesNamesMap)
		};

		if (projectionAttributes.length > 0) {
			input.ProjectionExpression = projectionAttributes
				.map((attribute) => attributesNamesMap.get(attribute)!)
				.join(', ');
		}

		if (attributes.length > 0) {
			input.FilterExpression = attributes
				.map((attribute) =>
					this.generateExpression(
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

	private canAttributeHaveValue(expression: DynamoFilterExpression): boolean {
		const valueExpressions = Object.values(DynamoFilterExpressionWithValue);
		return valueExpressions.includes(expression as DynamoFilterExpressionWithValue);
	}

	private generateAttributeName(attribute: string, index: number): string {
		if (attribute.includes('.')) {
			const parts = attribute.split('.');
			return parts.map((_, i) => `#attr${index}_${i}`).join('.');
		} else {
			return `#attr${index}`;
		}
	}

	private genetrateAttributeNamesRecord(
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

	private generateExpression(
		expression: DynamoFilterExpression,
		variableName: string,
		valueName?: string
	): string {
		if (this.canAttributeHaveValue(expression) && valueName == null) {
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

	private logError(message: string, error?: Error | unknown) {
		this.logger.error(error, `Balerial Dynamo repository error: ${message}`);
	}
}
