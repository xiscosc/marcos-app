import { DynamoFilterElement } from '../type/filter.dynamodb.type';
import {
	ISecondaryDynamoDbIndex,
	IPrimaryDynamoDbIndex,
	DynamoDbIndexType,
	DynamoDbIndexKeyType
} from '../type/index.dynamodb.type';

export class BalerialDynamoTable {
	private constructor(
		private readonly tableName: string,
		private primaryIndex: IPrimaryDynamoDbIndex,
		private secondaryIndexesMap: Map<string, ISecondaryDynamoDbIndex>,
		private defaultFilters: DynamoFilterElement[]
	) {}

	public static create(builder: BalerialDynamoTableBuilder): BalerialDynamoTable {
		const primaryIndex = builder.getPrimaryIndex();
		const tableName = builder.getTableName();

		if (!primaryIndex) {
			throw new Error('Primary index must be set');
		}
		if (!tableName) {
			throw new Error('Table name must be set');
		}

		return new BalerialDynamoTable(
			tableName,
			primaryIndex,
			builder.getSecondaryIndexesMap(),
			builder.getDefaultFilters()
		);
	}

	public getPrimaryIndex(): IPrimaryDynamoDbIndex {
		return this.primaryIndex;
	}

	public getSecondaryIndexes(): ISecondaryDynamoDbIndex[] {
		return Array.from(this.secondaryIndexesMap.values());
	}

	public getDefaultFilters(): DynamoFilterElement[] {
		return this.defaultFilters;
	}

	public getSecondaryIndex(indexName: string): ISecondaryDynamoDbIndex {
		const index = this.secondaryIndexesMap.get(indexName);
		if (!index) {
			throw new Error(`Secondary index ${indexName} not found`);
		}
		return index;
	}

	public getTableName(): string {
		return this.tableName;
	}
}

export class BalerialDynamoTableBuilder {
	private primaryIndex?: IPrimaryDynamoDbIndex;
	private secondaryIndexesMap: Map<string, ISecondaryDynamoDbIndex> = new Map();
	private tableName?: string;
	private defaultFilters: DynamoFilterElement[] = [];

	public getPrimaryIndex(): IPrimaryDynamoDbIndex | undefined {
		return this.primaryIndex;
	}

	public getSecondaryIndexesMap(): Map<string, ISecondaryDynamoDbIndex> {
		return this.secondaryIndexesMap;
	}

	public getTableName(): string | undefined {
		return this.tableName;
	}

	public getDefaultFilters(): DynamoFilterElement[] {
		return this.defaultFilters;
	}

	public setPrimaryIndex(
		partitionKeyName: string,
		partitionKeyType: DynamoDbIndexKeyType,
		sortKeyName?: string,
		sortKeyType?: DynamoDbIndexKeyType
	): this {
		this.primaryIndex = {
			type: DynamoDbIndexType.primary,
			partitionKeyName,
			partitionKeyType,
			sortKeyName,
			sortKeyType
		};
		return this;
	}

	public addSecondaryIndex(
		indexName: string,
		partitionKeyName: string,
		partitionKeyType: DynamoDbIndexKeyType,
		sortKeyName?: string,
		sortKeyType?: DynamoDbIndexKeyType
	): this {
		this.secondaryIndexesMap.set(indexName, {
			type: DynamoDbIndexType.secondary,
			indexName,
			partitionKeyName,
			partitionKeyType,
			sortKeyName,
			sortKeyType
		});
		return this;
	}

	public setTableName(tableName: string): this {
		if (tableName == null || tableName.length === 0) {
			throw new Error('Table name must be set');
		}

		this.tableName = tableName;
		return this;
	}

	public setDefaultFilters(filters: DynamoFilterElement[]): this {
		this.defaultFilters = filters;
		return this;
	}

	public build(): BalerialDynamoTable {
		return BalerialDynamoTable.create(this);
	}
}
