import 'dotenv/config';
import { lambdaOptimizeStorage } from '@marcsimolduressonsardina/lambda/optimize-storage';

console.log('Running optimize-images handler locally...');
lambdaOptimizeStorage(process.env.STORE_ID, process.env.FILES_BUCKET, process.env.FILE_TABLE)
	.then(() => {
		console.log('Handler finished successfully.');
	})
	.catch((error) => {
		console.error('Handler failed:', error);
	});
