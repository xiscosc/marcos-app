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
	MAIN_STORE_ID,
	MAINTENANCE_MODE,
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
import { redirect } from '@sveltejs/kit';

export class AuthService {
	public static generateConfiguration(user?: AppUser): ICoreConfiguration {
		if (user == null) redirect(303, '/auth/signin?callbackUrl=/');
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
			priceManager: false,
			priceMarkUp: 0
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
			priceManager: session.userMetadata.priceManager ?? false,
			priceMarkUp: 0
		};
	}

	public static async checkAuth(locals: App.Locals): Promise<void> {
		const inMaintenance = MAINTENANCE_MODE === 'yes';
		if (inMaintenance) {
			redirect(307, '/maintenance');
		}

		const appUser = locals.user;
		if (!appUser) redirect(303, '/auth/signin?callbackUrl=/');
	}

	public static isAdmin(user?: AppUser): boolean {
		return user?.priceManager ?? false;
	}

	public static isMainStore(user?: AppUser): boolean {
		return user?.storeId === MAIN_STORE_ID;
	}
}
