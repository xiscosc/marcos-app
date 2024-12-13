import type { StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Bucket } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export interface MssStackProps extends StackProps {
	envName: string;
	allowedUploadOrigins: string[];
	mainStoreId: string;
}

export type StoreTables = {
	customerTable: Table;
	orderTable: Table;
	calculatedItemOrderTable: Table;
	listPricingTable: Table;
	fileTable: Table;
	configTable: Table;
};

export type AnalyticsTables = {
	orderAuditTrailTable: Table;
};

export type DynamoTableSet = {
	storeTables: StoreTables;
	analyticsTables: AnalyticsTables;
};

export type BucketSet = {
	moldPricesBucket: Bucket;
	filesBucket: Bucket;
	reportsBucket: Bucket;
};

export type QueueSet = {
	orderAuditTrailQueue: Queue;
};
