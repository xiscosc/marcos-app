import { DynamoFilterElement, DynamoSortQueryElement } from './filter.dynamodb.type';

export type DynamoGetRequest = {
	indexName?: string;
	partitionKeyValue: string | number;
	descendent?: boolean;
	filters?: DynamoFilterElement[];
	sortQuery?: DynamoSortQueryElement;
};

export type DynamoGetRequestPaginated = DynamoGetRequest & {
	startKey?: Record<string, string | number>;
};

export type DynamoScanRequest = {
	filterAttributes?: DynamoFilterElement[];
	limit?: number;
	indexName?: string;
	startKey?: Record<string, string | number>;
	projectionAttributes?: string[];
};
