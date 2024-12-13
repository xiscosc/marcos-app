import type { PricingService } from '@marcsimolduressonsardina/core/service';
import { PricingType, type AllPrices } from '@marcsimolduressonsardina/core/type';

export class PricingHelper {
	public static async getPricing(pricingProvider: PricingService): Promise<AllPrices> {
		const moldPricesPromise = pricingProvider.getPricingList(PricingType.MOLD);
		const glassPromise = pricingProvider.getPricingList(PricingType.GLASS);
		const ppPricesPromise = pricingProvider.getPricingList(PricingType.PP);
		const backPricesPromise = pricingProvider.getPricingList(PricingType.BACK);
		const labourPricesPromise = pricingProvider.getPricingList(PricingType.LABOUR);
		const otherPricesPromise = pricingProvider.getPricingList(PricingType.OTHER);
		const transportPricesPromise = pricingProvider.getPricingList(PricingType.TRANSPORT);
		const hangerPricesPromise = pricingProvider.getPricingList(PricingType.HANGER);
		const [
			moldPrices,
			glassPrices,
			ppPrices,
			backPrices,
			otherPrices,
			labourPrices,
			transportPrices,
			hangerPrices
		] = await Promise.all([
			moldPricesPromise,
			glassPromise,
			ppPricesPromise,
			backPricesPromise,
			otherPricesPromise,
			labourPricesPromise,
			transportPricesPromise,
			hangerPricesPromise
		]);
		return {
			moldPrices,
			glassPrices,
			ppPrices,
			backPrices,
			otherPrices,
			labourPrices,
			transportPrices,
			hangerPrices
		};
	}
}
