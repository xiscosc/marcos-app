import { ICoreConfigurationForAWSLambda } from '@marcsimolduressonsardina/core/config';
import { FileService } from '@marcsimolduressonsardina/core/service';
import { AppUser } from '@marcsimolduressonsardina/core/type';

export async function lambdaOptimizeStorage(
	storeId?: string,
	filesBucketName?: string,
	filesTableName?: string
) {
	const user: AppUser = {
		id: 'automation@lambda.aws',
		storeId: storeId ?? '',
		name: 'AWS LAMBDA',
		priceManager: true
	};
	const configuration: ICoreConfigurationForAWSLambda = {
		runInAWSLambda: true,
		storeId: user.storeId,
		filesBucket: filesBucketName,
		fileTable: filesTableName,
		orderAuditTrailTable: 'not-used',
		user
	};
	const fileService = new FileService(configuration);
	await fileService.optimizePhotoStorage();
}
