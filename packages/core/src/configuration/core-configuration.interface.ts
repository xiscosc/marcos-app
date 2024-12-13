import { AwsCredentialIdentity } from "@smithy/types";
import { AppUser } from "../types/user.type";

interface ICoreConfigurationBase {
  storeId: string;
  orderTable?: string;
  customerTable?: string;
  configTable?: string;
  calculatedItemTable?: string;
  fileTable?: string;
  listPricingTable?: string;
  orderAuditTrailTable?: string;
  filesBucket?: string;
  reportsBucket?: string;
  moldPricesBucket?: string;
  runInAWSLambda: boolean;
  user: AppUser;
  disableOrderAuditTrail?: boolean;
}

export interface ICoreConfiguration extends ICoreConfigurationBase {
  runInAWSLambda: false;
  region: string;
  credentials: AwsCredentialIdentity;
}

export interface ICoreConfigurationForAWSLambda extends ICoreConfigurationBase {
  runInAWSLambda: true;
}

export const PUBLIC_REPOSITORY = "public-repo";

export interface ICorePublicConfiguration extends ICoreConfiguration {
  storeId: "public-repo";
}

export interface ICorePublicConfigurationForAWSLambda
  extends ICoreConfigurationForAWSLambda {
  storeId: "public-repo";
}
