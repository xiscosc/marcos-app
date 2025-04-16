import { S3CreateEvent } from 'aws-lambda';
import 'dotenv/config';
import { handler } from '../src/lambda/optimize-images.lambda.js';

// Example mock S3 event (customize as needed)
const mockEvent: S3CreateEvent = {
	Records: [
		{
			eventVersion: '2.1',
			eventSource: 'aws:s3',
			awsRegion: 'us-east-1',
			eventTime: new Date().toISOString(),
			eventName: 'ObjectCreated:Put',
			userIdentity: {
				principalId: 'EXAMPLE'
			},
			requestParameters: {
				sourceIPAddress: '127.0.0.1'
			},
			responseElements: {
				'x-amz-request-id': 'EXAMPLE123456789',
				'x-amz-id-2': 'EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH'
			},
			s3: {
				s3SchemaVersion: '1.0',
				configurationId: 'testConfigRule',
				bucket: {
					name: process.env.FILES_BUCKET || 'your_local_or_dev_bucket_name', // Use bucket from .env
					ownerIdentity: {
						principalId: 'EXAMPLE'
					},
					arn: `arn:aws:s3:::${process.env.FILES_BUCKET || 'your_local_or_dev_bucket_name'}`
				},
				object: {
					key: '4f5b05fb-8419-468f-b9bd-2c04cfd3a5b2/photo/b3b06e2f-d440-4d98-8f1a-bc9370d11656.jpeg', // Key of the object to process
					size: 1024,
					eTag: '0123456789abcdef0123456789abcdef',
					sequencer: '0A1B2C3D4E5F678901'
				}
			}
		}
	]
};

console.log('Running optimize-images handler locally...');
handler(mockEvent)
	.then(() => {
		console.log('Handler finished successfully.');
	})
	.catch((error) => {
		console.error('Handler failed:', error);
	});
