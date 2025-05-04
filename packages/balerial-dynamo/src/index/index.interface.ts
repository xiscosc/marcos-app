export enum DynamoDbIndexType {
	primary = 'PRIMARY',
	secondary = 'SECONDARY'
}

export interface IDynamoDbIndex {
	type: DynamoDbIndexType;
	partitionKeyName: string;
	sortKeyName?: string;
	partitionKeyType: 'S' | 'N';
	sortKeyType?: 'S' | 'N';
}

export interface IPrimaryDynamoDbIndex extends IDynamoDbIndex {
	type: DynamoDbIndexType.primary;
}

export interface ISecondaryDynamoDbIndex extends IDynamoDbIndex {
	type: DynamoDbIndexType.secondary;
	indexName: string;
}
