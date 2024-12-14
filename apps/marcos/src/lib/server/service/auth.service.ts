import {
	AWS_ACCESS_KEY_ID,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
	CALCULATED_ITEM_ORDER_TABLE,
	CONFIG_TABLE,
	CUSTOMER_TABLE,
	FILE_TABLE,
	FILES_BUCKET,
	LIST_PRICING_TABLE,
	MOLD_PRICES_BUCKET,
	ORDER_AUDIT_TRAIL_TABLE,
	ORDER_TABLE,
	REPORTS_BUCKET
} from '$env/static/private';
import type { CustomSession } from '$lib/type/api.type';
import {
	PUBLIC_REPOSITORY,
	type ICoreConfiguration,
	type ICorePublicConfiguration
} from '@marcsimolduressonsardina/core/config';
import type { AppUser } from '@marcsimolduressonsardina/core/type';

export class AuthService {
	public static generateConfiguration(user: AppUser): ICoreConfiguration {
		return {
			runInAWSLambda: false,
			user,
			region: AWS_REGION,
			calculatedItemTable: CALCULATED_ITEM_ORDER_TABLE,
			configTable: CONFIG_TABLE,
			customerTable: CUSTOMER_TABLE,
			storeId: user.storeId,
			filesBucket: FILES_BUCKET,
			moldPricesBucket: MOLD_PRICES_BUCKET,
			fileTable: FILE_TABLE,
			listPricingTable: LIST_PRICING_TABLE,
			orderAuditTrailTable: ORDER_AUDIT_TRAIL_TABLE,
			reportsBucket: REPORTS_BUCKET,
			orderTable: ORDER_TABLE,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			}
		};
	}

	public static generatePublicConfig(): ICorePublicConfiguration {
		const user = {
			id: 'public',
			name: 'public',
			storeId: PUBLIC_REPOSITORY,
			priceManager: false
		};

		return AuthService.generateConfiguration(user) as ICorePublicConfiguration;
	}

	public static generateUserFromAuth(session?: CustomSession): AppUser | undefined {
		if (
			session == null ||
			session.user == null ||
			session.userMetadata == null ||
			session.userMetadata.storeId == null
		) {
			return undefined;
		}

		return {
			id: session.user.email!,
			name: session.user.name!,
			storeId: session.userMetadata.storeId,
			priceManager: session.userMetadata.priceManager ?? false
		};
	}
}
