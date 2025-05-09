import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import type { DynamoTableSet } from '../types.js';
import {
	customerTableBuilder,
	configTableBuilder,
	fileTableBuilder,
	orderTableBuilder,
	listPricingTableBuilder,
	calculatedItemTableBuilder,
	orderAuditTrailTableBuilder
} from '@marcsimolduressonsardina/core/db';
import {
	DynamoDbIndexKeyType,
	IPrimaryDynamoDbIndex,
	ISecondaryDynamoDbIndex
} from '@balerial/dynamo/type';

export function createDynamoTables(scope: Construct, envName: string): DynamoTableSet {
	return {
		storeTables: {
			customerTable: createCustomerTable(scope, envName),
			orderTable: createOrderTable(scope, envName),
			calculatedItemOrderTable: createCalculatedItemOrderTable(scope, envName),
			listPricingTable: createListPricingTable(scope, envName),
			fileTable: createFileTable(scope, envName),
			configTable: createConfigTable(scope, envName)
		},
		analyticsTables: {
			orderAuditTrailTable: createOrderAuditTrailTable(scope, envName)
		}
	};
}

function createCustomerTable(scope: Construct, envName: string): Table {
	const tableIndexes = customerTableBuilder.buildIndexes();
	const table = createTable(scope, envName, `${envName}-customer-v2`, tableIndexes.primaryIndex);

	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createConfigTable(scope: Construct, envName: string): Table {
	const tableIndexes = configTableBuilder.buildIndexes();
	const table = createTable(scope, envName, `${envName}-config`, tableIndexes.primaryIndex);

	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createFileTable(scope: Construct, envName: string): Table {
	const tableIndexes = fileTableBuilder.buildIndexes();
	const table = createTable(scope, envName, `${envName}-file`, tableIndexes.primaryIndex);
	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createOrderTable(scope: Construct, envName: string): Table {
	const tableIndexes = orderTableBuilder.buildIndexes();
	const table = createTable(scope, envName, `${envName}-order-v2`, tableIndexes.primaryIndex);
	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createListPricingTable(scope: Construct, envName: string): Table {
	const tableIndexes = listPricingTableBuilder.buildIndexes();
	const table = createTable(
		scope,
		envName,
		`${envName}-list-pricing-v2`,
		tableIndexes.primaryIndex
	);
	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createCalculatedItemOrderTable(scope: Construct, envName: string): Table {
	const tableIndexes = calculatedItemTableBuilder.buildIndexes();
	const table = createTable(
		scope,
		envName,
		`${envName}-calculated-item-order`,
		tableIndexes.primaryIndex
	);
	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createOrderAuditTrailTable(scope: Construct, envName: string): Table {
	const tableIndexes = orderAuditTrailTableBuilder.buildIndexes();
	const table = createTable(
		scope,
		envName,
		`${envName}-order-audit-trail-v3`,
		tableIndexes.primaryIndex
	);

	addSecondaryIndexes(tableIndexes.secondaryIndexes, table);
	return table;
}

function createTable(
	scope: Construct,
	envName: string,
	tableName: string,
	index: IPrimaryDynamoDbIndex
): Table {
	return new Table(scope, `${tableName}-table`, {
		tableName,
		...generateIndexParams(index),
		billingMode: BillingMode.PAY_PER_REQUEST,
		pointInTimeRecoverySpecification: {
			pointInTimeRecoveryEnabled: envName === 'prod'
		}
	});
}

function addSecondaryIndexes(indexes: ISecondaryDynamoDbIndex[], table: Table) {
	indexes.forEach((index) => {
		table.addGlobalSecondaryIndex({
			indexName: index.indexName,
			...generateIndexParams(index)
		});
	});
}

function generateIndexParams(index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex) {
	return {
		partitionKey: {
			name: index.partitionKeyName,
			type: getAttributeType(index.partitionKeyType)
		},
		sortKey:
			index.sortKeyName == null || index.sortKeyType == null
				? undefined
				: {
						name: index.sortKeyName,
						type: getAttributeType(index.sortKeyType)
					}
	};
}

function getAttributeType(type: DynamoDbIndexKeyType): AttributeType {
	if (type === DynamoDbIndexKeyType.string) return AttributeType.STRING;
	return AttributeType.NUMBER;
}
