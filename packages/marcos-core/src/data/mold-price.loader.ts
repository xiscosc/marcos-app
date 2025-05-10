import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { read } from 'xlsx';

import { PricingService } from '../service/pricing.service';
import { S3Util } from './s3.util';
import { ListPrice, PricingFormula, PricingType } from '../types/pricing.type';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { getClientConfiguration } from '../configuration/configuration.util';

export class MoldPriceLoader {
	private service: PricingService;
	private s3Client: S3Client;
	constructor(private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda) {
		this.service = new PricingService(config);
		this.s3Client = new S3Client(getClientConfiguration(config));

		if (this.config.moldPricesBucket == null) {
			throw Error('mold bucket is needed');
		}
	}

	public async generateFileUploadUrl(): Promise<{
		filename: string;
		url: string;
	}> {
		const filename = `${uuidv4()}.xlsx`;
		const url = await S3Util.getPresignedUploadUrl(
			this.s3Client,
			this.config.moldPricesBucket!,
			filename,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			350
		);
		return { filename, url };
	}

	public async loadMoldPrices(fileName: string): Promise<void> {
		const currentPrices = await this.service.getPricingList(PricingType.MOLD);
		const newPrices = await this.getPricesFromExcel(fileName);
		await this.service.deleteListPrices(currentPrices);
		await this.service.batchStoreListPrices(PricingType.MOLD, Array.from(newPrices.values()));
	}

	private async getPricesFromExcel(fileName: string): Promise<Map<string, ListPrice>> {
		const buffer = await this.getExcelFromS3(fileName);
		const file = read(buffer, { type: 'buffer' });
		const sheet = file.Sheets['TODAS'];
		if (sheet == null) throw Error('Sheet not found');

		const end = sheet['!ref']!.split(':')[1];
		const maxrow = parseInt(end!.split(/([A-Z])/)[2]!, 10);

		let count = 2;
		const prices = new Map<string, ListPrice>();
		while (count < maxrow) {
			const internalId = sheet[`A${count}`];
			const externalId = sheet[`B${count}`];
			const price = sheet[`C${count}`];
			const floating = sheet[`D${count}`];

			if (internalId && externalId && price) {
				const id = `${internalId.v}_${externalId.v}`;
				if (Number.isNaN(Number(price.v))) {
					const cleanPrice = price.v.toString().replace(' ', '').replace(',', '.');
					if (!Number.isNaN(Number(cleanPrice))) {
						const calcPrice = Math.ceil(Number(cleanPrice) * 100) / 100;
						prices.set(
							id,
							MoldPriceLoader.createPricing(
								id,
								calcPrice,
								externalId.v,
								internalId.v,
								MoldPriceLoader.getFloating(floating)
							)
						);
					}
				} else {
					prices.set(
						id,
						MoldPriceLoader.createPricing(
							id,
							Math.ceil(Number(price.v) * 100) / 100,
							externalId.v,
							internalId.v,
							MoldPriceLoader.getFloating(floating)
						)
					);
				}
			}
			count += 1;
		}

		return prices;
	}

	private static createPricing(
		id: string,
		price: number,
		externalId: string,
		internalId: string,
		floating: boolean
	): ListPrice {
		return {
			id,
			internalId: uuidv4(),
			price,
			minPrice: 0,
			discountAllowed: true,
			description: `${externalId} UBI: ${internalId}`,
			type: PricingType.MOLD,
			formula: PricingFormula.NONE,
			areas: [],
			areasM2: [],
			priority: 0,
			floating
		};
	}

	private static getFloating(floating?: { v: string }): boolean {
		return floating?.v === 'S';
	}

	private async getExcelFromS3(fileName: string): Promise<ArrayBuffer> {
		const url = await S3Util.getPresignedDownloadUrl(
			this.s3Client,
			this.config.moldPricesBucket!,
			fileName,
			3600
		);

		try {
			// Using fetch instead of S3Client since it does not work on Cloudflare Pages
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to retrieve file from S3.');
			}

			const arrayBuffer = await response.arrayBuffer();
			return arrayBuffer;
		} catch (error) {
			throw new Error(`Failed to retrieve file from S3: ${error}`);
		}
	}
}
