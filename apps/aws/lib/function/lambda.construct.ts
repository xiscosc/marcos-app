import { BucketSet, DynamoTableSet } from '../types.js';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import path from 'path';
import { fileURLToPath } from 'url';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

export function createLambdas(
	scope: Construct,
	envName: string,
	mainStoreId: string,
	tables: DynamoTableSet,
	buckets: BucketSet
) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const LAMBDA_DIR = `${__dirname}/../../src/lambda/`;

	const sharpLayer = new LayerVersion(scope, `${envName}-sharp-layer`, {
		code: Code.fromAsset('sharp-layer.zip'),
		compatibleRuntimes: [Runtime.NODEJS_20_X],
		description: 'Layer with sharp library',
		compatibleArchitectures: [Architecture.ARM_64]
	});

	// REPORTS LAMBDA

	const reportsMainStoreLambda = new NodejsFunction(scope, `${envName}-generate-reports`, {
		entry: `${LAMBDA_DIR}generate-reports.lambda.ts`,
		functionName: `${envName}-generate-reports`,
		handler: 'handler',
		memorySize: 512,
		timeout: Duration.seconds(10),
		logRetention: RetentionDays.ONE_MONTH,
		runtime: Runtime.NODEJS_20_X,
		architecture: Architecture.ARM_64,
		bundling: {
			minify: true,
			sourceMap: true
		},
		environment: {
			STORE_ID: mainStoreId,
			ORDER_AUDIT_TRAIL_TABLE: tables.analyticsTables.orderAuditTrailTable.tableName,
			ORDER_TABLE: tables.storeTables.orderTable.tableName,
			CUSTOMER_TABLE: tables.storeTables.customerTable.tableName,
			REPORTS_BUCKET: buckets.reportsBucket.bucketName,
			CALCULATED_ITEM_ORDER_TABLE: tables.storeTables.calculatedItemOrderTable.tableName
		}
	});

	tables.analyticsTables.orderAuditTrailTable.grantReadData(reportsMainStoreLambda);
	tables.storeTables.orderTable.grantReadData(reportsMainStoreLambda);
	tables.storeTables.customerTable.grantReadData(reportsMainStoreLambda);
	tables.storeTables.calculatedItemOrderTable.grantReadData(reportsMainStoreLambda);
	buckets.reportsBucket.grantReadWrite(reportsMainStoreLambda);

	const generateReportsRule = new Rule(scope, `${envName}-reportsEventRule`, {
		schedule: Schedule.cron({
			minute: '50',
			hour: '21'
		})
	});
	generateReportsRule.addTarget(new LambdaFunction(reportsMainStoreLambda));

	// IMAGE OPTMIZATION

	const imageOptimizationLambda = new NodejsFunction(scope, `${envName}-optimize-images`, {
		entry: `${LAMBDA_DIR}optimize-images.lambda.ts`,
		functionName: `${envName}-optimize-images`,
		handler: 'handler',
		memorySize: 512,
		timeout: Duration.seconds(10),
		logRetention: RetentionDays.ONE_MONTH,
		runtime: Runtime.NODEJS_20_X,
		architecture: Architecture.ARM_64,
		bundling: {
			minify: true,
			sourceMap: true
		},
		environment: {
			STORE_ID: mainStoreId,
			FILE_TABLE: tables.storeTables.fileTable.tableName,
			FILES_BUCKET: buckets.filesBucket.bucketName
		},
		layers: [sharpLayer]
	});

	tables.storeTables.fileTable.grantReadWriteData(imageOptimizationLambda);
	buckets.filesBucket.grantReadWrite(imageOptimizationLambda);

	// Trigger lambda when an object is stored on the bucket
	buckets.filesBucket.addObjectCreatedNotification(new LambdaDestination(imageOptimizationLambda));
}
