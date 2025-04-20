import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createDynamoTables } from './database/dynamo-db.construct.js';
import type { MssStackProps } from './types.js';
import { createBuckets } from './file/s3.construct.js';
import { ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { createLambdas } from './function/lambda.construct.js';

export class MmSsStack extends Stack {
	private readonly props: MssStackProps;
	constructor(scope: Construct, id: string, props: MssStackProps) {
		super(scope, id, props);
		this.props = props;

		const tables = createDynamoTables(this, this.props.envName);
		const buckets = createBuckets(this, this.props.allowedUploadOrigins, this.props.envName);
		createLambdas(
			this,
			this.props.envName,
			this.props.mainStoreId,
			this.props.postHogKey,
			tables,
			buckets
		);

		// Create Main store policies
		const bucketArns = Object.entries(buckets)
			.map((entry) => entry[1])
			.map((bucket) => bucket.arnForObjects('*'));

		const storeTableArns = [...Object.entries(tables.storeTables)]
			.map((entry) => entry[1])
			.map((table) => table.tableArn);

		const analyticsTableArns = [...Object.entries(tables.analyticsTables)]
			.map((entry) => entry[1])
			.map((table) => table.tableArn);

		// Read policy
		const mainStoreReadPolicy = new ManagedPolicy(
			this,
			`${this.props.envName}-main-store-read-policy`,
			{
				managedPolicyName: `${this.props.envName}-main-store-read-policy`,
				statements: [
					new PolicyStatement({
						actions: ['s3:GetObject'],
						resources: bucketArns
					}),
					new PolicyStatement({
						actions: [
							'dynamodb:BatchGetItem',
							'dynamodb:GetItem',
							'dynamodb:Scan',
							'dynamodb:Query'
						],
						resources: [...storeTableArns, ...analyticsTableArns]
					}),
					new PolicyStatement({
						actions: ['dynamodb:Scan', 'dynamodb:Query'],
						resources: [...storeTableArns, ...analyticsTableArns].map((arn) => `${arn}/index/*`)
					})
				]
			}
		);

		// Write policy
		const mainStoreWritePolicy = new ManagedPolicy(
			this,
			`${this.props.envName}-main-store-write-policy`,
			{
				managedPolicyName: `${this.props.envName}-main-store-write-policy`,
				statements: [
					new PolicyStatement({
						actions: ['s3:PutObject', 's3:DeleteObject', 's3:PutObjectTagging'],
						resources: bucketArns
					}),
					new PolicyStatement({
						actions: [
							'dynamodb:BatchWriteItem',
							'dynamodb:PutItem',
							'dynamodb:DeleteItem',
							'dynamodb:UpdateItem'
						],
						resources: [...storeTableArns, ...analyticsTableArns]
					})
				]
			}
		);

		new CfnOutput(this, `${this.props.envName}-main-store-read-policy-output`, {
			value: mainStoreReadPolicy.managedPolicyArn,
			description: 'The ARN of the main store read policy',
			exportName: `${this.props.envName}-main-store-read-policy-output`
		});

		new CfnOutput(this, `${this.props.envName}-main-store-write-policy-output`, {
			value: mainStoreWritePolicy.managedPolicyArn,
			description: 'The ARN of the main store write policy',
			exportName: `${this.props.envName}-main-store-write-policy-output`
		});
	}
}
