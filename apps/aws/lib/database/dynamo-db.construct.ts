import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import type { DynamoTableSet } from "../types.js";
import {
  IPrimaryDynamoDbIndex,
  ISecondaryDynamoDbIndex,
  CalculatedItemDynamoDbIndex,
  ConfigDynamoDbIndex,
  CustomerDynamoDbIndex,
  FileDynamoDbIndex,
  ListPricingDynamoDbIndex,
  OrderAuditTrailDynamoDbIndex,
  OrderDynamoDbIndex,
} from "@marcsimolduressonsardina/core/db";

export function createDynamoTables(
  scope: Construct,
  envName: string,
): DynamoTableSet {
  return {
    storeTables: {
      customerTable: createCustomerTable(scope, envName),
      orderTable: createOrderTable(scope, envName),
      calculatedItemOrderTable: createCalculatedItemOrderTable(scope, envName),
      listPricingTable: createListPricingTable(scope, envName),
      fileTable: createFileTable(scope, envName),
      configTable: createConfigTable(scope, envName),
    },
    analyticsTables: {
      orderAuditTrailTable: createOrderAuditTrailTable(scope, envName),
    },
  };
}

function createCustomerTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-customer-v2`,
    CustomerDynamoDbIndex.primaryIndex,
  );

  addSecondaryIndexes(CustomerDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createConfigTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-config`,
    ConfigDynamoDbIndex.primaryIndex,
  );

  addSecondaryIndexes(ConfigDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createFileTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-file`,
    FileDynamoDbIndex.primaryIndex,
  );
  addSecondaryIndexes(FileDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createOrderTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-order-v2`,
    OrderDynamoDbIndex.primaryIndex,
  );
  addSecondaryIndexes(OrderDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createListPricingTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-list-pricing-v2`,
    ListPricingDynamoDbIndex.primaryIndex,
  );
  addSecondaryIndexes(ListPricingDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createCalculatedItemOrderTable(
  scope: Construct,
  envName: string,
): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-calculated-item-order`,
    CalculatedItemDynamoDbIndex.primaryIndex,
  );
  addSecondaryIndexes(CalculatedItemDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createOrderAuditTrailTable(scope: Construct, envName: string): Table {
  const table = createTable(
    scope,
    envName,
    `${envName}-order-audit-trail-v3`,
    OrderAuditTrailDynamoDbIndex.primaryIndex,
  );

  addSecondaryIndexes(OrderAuditTrailDynamoDbIndex.secondaryIndexes, table);
  return table;
}

function createTable(
  scope: Construct,
  envName: string,
  tableName: string,
  index: IPrimaryDynamoDbIndex,
): Table {
  return new Table(scope, `${tableName}-table`, {
    tableName,
    ...generateIndexParams(index),
    billingMode: BillingMode.PAY_PER_REQUEST,
    pointInTimeRecovery: envName === "prod",
  });
}

function addSecondaryIndexes(indexes: ISecondaryDynamoDbIndex[], table: Table) {
  indexes.forEach((index) => {
    table.addGlobalSecondaryIndex({
      indexName: index.indexName,
      ...generateIndexParams(index),
    });
  });
}

function generateIndexParams(
  index: IPrimaryDynamoDbIndex | ISecondaryDynamoDbIndex,
) {
  return {
    partitionKey: {
      name: index.partitionKeyName,
      type: getAttributeType(index.partitionKeyType),
    },
    sortKey:
      index.sortKeyName == null || index.sortKeyType == null
        ? undefined
        : {
            name: index.sortKeyName,
            type: getAttributeType(index.sortKeyType),
          },
  };
}

function getAttributeType(type: "S" | "N"): AttributeType {
  if (type === "S") return AttributeType.STRING;
  return AttributeType.NUMBER;
}
