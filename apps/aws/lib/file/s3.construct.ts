import { Duration } from 'aws-cdk-lib';
import {
	BlockPublicAccess,
	Bucket,
	type BucketProps,
	type CorsRule,
	HttpMethods,
	LifecycleRule,
	StorageClass
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { BucketSet } from '../types.js';

export function createBuckets(
	scope: Construct,
	allowedUploadOrigins: string[],
	envName: string
): BucketSet {
	const corsRule: CorsRule = {
		allowedMethods: [HttpMethods.PUT, HttpMethods.POST],
		allowedOrigins: allowedUploadOrigins,
		allowedHeaders: ['*'],
		exposedHeaders: ['Access-Control-Allow-Origin']
	};

	const moldPricesBucketProps: BucketProps = {
		bucketName: `mmss-${envName}-mold-prices`,
		cors: [corsRule],
		lifecycleRules: [{ expiration: Duration.days(7) }],
		blockPublicAccess: BlockPublicAccess.BLOCK_ALL
	};

	const expiryLifecycleRule: LifecycleRule = {
		id: `${envName}-expiry-lifecycle-rule`,
		expiration: Duration.days(7),
		tagFilters: {
			expiry: 'true'
		}
	};

	const intelligentTieringLifecycleRule: LifecycleRule = {
		id: `${envName}-intelligent-tiering-lifecycle-rule`,
		transitions: [
			{ storageClass: StorageClass.INTELLIGENT_TIERING, transitionAfter: Duration.days(0) }
		]
	};

	const filesBucketProps: BucketProps = {
		bucketName: `mmss-${envName}-files`,
		cors: [corsRule],
		lifecycleRules: [expiryLifecycleRule, intelligentTieringLifecycleRule],
		blockPublicAccess: BlockPublicAccess.BLOCK_ALL
	};

	const reportsBucketProps: BucketProps = {
		bucketName: `mmss-${envName}-reports`,
		blockPublicAccess: BlockPublicAccess.BLOCK_ALL
	};

	const moldPricesBucket = new Bucket(scope, `mmss-${envName}-mold-prices`, moldPricesBucketProps);
	const filesBucket = new Bucket(scope, `mmss-${envName}-files`, filesBucketProps);
	const reportsBucket = new Bucket(scope, `mmss-${envName}-reports`, reportsBucketProps);
	return { moldPricesBucket, filesBucket, reportsBucket };
}
