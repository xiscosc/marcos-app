import { ConfigRepositoryDynamoDb } from "../repository/dynamodb/config.repository.dynamodb";
import type { ConfigDto } from "../repository/dto/config.dto";
import {
  LOCATIONS_CONFIG_ID,
  type LocationsConfigType,
} from "./constants/config.constants";
import {
  ICoreConfiguration,
  ICoreConfigurationForAWSLambda,
} from "../configuration/core-configuration.interface";

export class ConfigService {
  private repository: ConfigRepositoryDynamoDb;

  constructor(
    private readonly config:
      | ICoreConfiguration
      | ICoreConfigurationForAWSLambda,
  ) {
    this.repository = new ConfigRepositoryDynamoDb(config);
  }

  public async getLocationsList(): Promise<LocationsConfigType> {
    const locations =
      await this.repository.getConfigValue<LocationsConfigType>(
        LOCATIONS_CONFIG_ID,
      );

    if (locations == null) {
      return [];
    }

    return locations;
  }

  public async storeLocationsList(locations: LocationsConfigType) {
    const locationsDto: ConfigDto = {
      storeId: this.config.storeId,
      id: LOCATIONS_CONFIG_ID,
      value: locations,
    };

    await this.repository.storeConfigValue(locationsDto);
  }
}
