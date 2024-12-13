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

export class CalculatedItemDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'orderUuid',
		partitionKeyType: 'S'
	};

	public static readonly secondaryIndexes = [];
}

export class ConfigDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'storeId',
		partitionKeyType: 'S',
		sortKeyName: 'id',
		sortKeyType: 'S'
	};

	public static readonly secondaryIndexes = [];
}

export class CustomerDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'uuid',
		partitionKeyType: 'S'
	};

	public static readonly storeIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'store',
		partitionKeyName: 'storeId',
		partitionKeyType: 'S',
		sortKeyName: 'phone',
		sortKeyType: 'S'
	};

	public static readonly secondaryIndexes = [this.storeIndex];
}

export class FileDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'orderUuid',
		partitionKeyType: 'S',
		sortKeyName: 'fileUuid',
		sortKeyType: 'S'
	};

	public static readonly secondaryIndexes = [];
}

export class ListPricingDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'uuid',
		partitionKeyType: 'S'
	};

	public static readonly typeIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'type',
		partitionKeyName: 'type',
		partitionKeyType: 'S',
		sortKeyName: 'id',
		sortKeyType: 'S'
	};

	public static readonly secondaryIndexes = [this.typeIndex];
}

export class OrderAuditTrailDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'uuid',
		partitionKeyType: 'S'
	};

	public static readonly orderIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'order',
		partitionKeyName: 'orderUuid',
		partitionKeyType: 'S',
		sortKeyName: 'timestamp',
		sortKeyType: 'N'
	};

	public static readonly storeIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'store',
		partitionKeyName: 'storeId',
		partitionKeyType: 'S',
		sortKeyName: 'timestamp',
		sortKeyType: 'N'
	};

	public static readonly secondaryIndexes = [this.orderIndex, this.storeIndex];
}

export class OrderDynamoDbIndex {
	public static readonly primaryIndex: IPrimaryDynamoDbIndex = {
		type: DynamoDbIndexType.primary,
		partitionKeyName: 'uuid',
		partitionKeyType: 'S'
	};

	public static readonly customerIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'customer',
		partitionKeyName: 'customerUuid',
		partitionKeyType: 'S',
		sortKeyName: 'timestamp',
		sortKeyType: 'N'
	};

	public static readonly shortIdIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'shortId',
		partitionKeyName: 'shortId',
		partitionKeyType: 'S'
	};

	public static readonly statusIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'status',
		partitionKeyName: 'status',
		partitionKeyType: 'S',
		sortKeyName: 'timestamp',
		sortKeyType: 'N'
	};

	public static readonly storeIndex: ISecondaryDynamoDbIndex = {
		type: DynamoDbIndexType.secondary,
		indexName: 'store',
		partitionKeyName: 'storeId',
		partitionKeyType: 'S',
		sortKeyName: 'timestamp',
		sortKeyType: 'N'
	};

	public static readonly secondaryIndexes = [
		this.customerIndex,
		this.shortIdIndex,
		this.statusIndex,
		this.storeIndex
	];
}
