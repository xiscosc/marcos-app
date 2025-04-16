import type { Customer } from '@marcsimolduressonsardina/core/type';

export class CustomerUtilites {
	public static getWhatsappLink(customer: Customer, text?: string): string {
		const link = `https://wa.me/${customer.phone.replace('+', '')}`;
		const encodedText = text == null ? '' : `?text=${encodeURI(text)}`;
		return link + encodedText;
	}
}
