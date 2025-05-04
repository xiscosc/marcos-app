import { IPrimaryDynamoDbIndex, ISecondaryDynamoDbIndex } from '../index/index.interface';

export enum DynamoSortExpression {
	EQUAL = 'equal',
	BETWEEN = 'between'
}

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

export type DynamoSortKeyExpression = {
	value: string | number | string[] | number[];
	expression: DynamoSortExpression;
};

export type BalerialDynamoQueryRequest = {
	index?: ISecondaryDynamoDbIndex;
	partitionKeyValue: string | number;
	startKey?: Record<string, string | number>;
	sortKeyExpression?: DynamoSortKeyExpression;
	descendent?: boolean;
	limit?: number;
	filters?: DynamoFilterElement[];
	paginated?: boolean;
};

export type BalerialDynamoScanRequest = {
	index: ISecondaryDynamoDbIndex;
	startKey?: Record<string, string | number>;
	descendent?: boolean;
	limit?: number;
	filters?: DynamoFilterElement[];
	paginated?: boolean;
};
