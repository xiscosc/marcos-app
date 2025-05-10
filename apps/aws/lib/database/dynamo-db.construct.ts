import { BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
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

import { IPrimaryDynamoDbIndex, ISecondaryDynamoDbIndex } from '@balerial/dynamo/type';
import { generateCdkIndexParams } from '@balerial/dynamo/tools';

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
	const balerialTable = customerTableBuilder.setTableName(`${envName}-customer-v2`).build();
	const table = createTable(
		scope,
		envName,
		`${envName}-customer-v2`,
		balerialTable.getPrimaryIndex()
	);

	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createConfigTable(scope: Construct, envName: string): Table {
	const balerialTable = configTableBuilder.setTableName(`${envName}-config`).build();
	const table = createTable(scope, envName, `${envName}-config`, balerialTable.getPrimaryIndex());

	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createFileTable(scope: Construct, envName: string): Table {
	const balerialTable = fileTableBuilder.setTableName(`${envName}-file`).build();
	const table = createTable(scope, envName, `${envName}-file`, balerialTable.getPrimaryIndex());
	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createOrderTable(scope: Construct, envName: string): Table {
	const balerialTable = orderTableBuilder.setTableName(`${envName}-order-v2`).build();
	const table = createTable(scope, envName, `${envName}-order-v2`, balerialTable.getPrimaryIndex());
	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createListPricingTable(scope: Construct, envName: string): Table {
	const balerialTable = listPricingTableBuilder.setTableName(`${envName}-list-pricing-v2`).build();
	const table = createTable(
		scope,
		envName,
		`${envName}-list-pricing-v2`,
		balerialTable.getPrimaryIndex()
	);
	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createCalculatedItemOrderTable(scope: Construct, envName: string): Table {
	const balerialTable = calculatedItemTableBuilder
		.setTableName(`${envName}-calculated-item-order`)
		.build();
	const table = createTable(
		scope,
		envName,
		`${envName}-calculated-item-order`,
		balerialTable.getPrimaryIndex()
	);
	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
	return table;
}

function createOrderAuditTrailTable(scope: Construct, envName: string): Table {
	const balerialTable = orderAuditTrailTableBuilder
		.setTableName(`${envName}-order-audit-trail-v3`)
		.build();
	const table = createTable(
		scope,
		envName,
		`${envName}-order-audit-trail-v3`,
		balerialTable.getPrimaryIndex()
	);

	addSecondaryIndexes(balerialTable.getSecondaryIndexes(), table);
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
		...generateCdkIndexParams(index),
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
			...generateCdkIndexParams(index)
		});
	});
}
