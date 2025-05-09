export enum DynamoFilterExpressionWithValue {
	EQUAL = 'equal',
	NOT_EQUAL = 'not_equal',
	CONTAINS = 'contains'
}

export enum DynamoQueryExpression {
	EQUAL = 'equal',
	BETWEEN = 'between'
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

export type DynamoSortQueryElement = {
	expression: DynamoQueryExpression;
	value: string | number | { start: string | number; end: string | number };
};
