import { ScalarAttributeType } from '@aws-sdk/client-dynamodb';

export enum DynamoDbIndexType {
	primary = 'PRIMARY',
	secondary = 'SECONDARY'
}

export enum DynamoDbIndexKeyType {
	string = 'S',
	number = 'N'
}

export interface IDynamoDbIndex {
	type: DynamoDbIndexType;
	partitionKeyName: string;
	sortKeyName?: string;
	partitionKeyType: DynamoDbIndexKeyType;
	sortKeyType?: DynamoDbIndexKeyType;
}

export interface IPrimaryDynamoDbIndex extends IDynamoDbIndex {
	type: DynamoDbIndexType.primary;
}

export interface ISecondaryDynamoDbIndex extends IDynamoDbIndex {
	type: DynamoDbIndexType.secondary;
	indexName: string;
}
