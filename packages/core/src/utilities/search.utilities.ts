export class SearchUtilities {
	public static normalizeString(input: string): string {
		// Convert to lowercase
		let normalized = input.toLowerCase();

		// Remove diacritics (accents)
		normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

		// Remove special characters (anything that is not a letter, number, or whitespace)
		normalized = normalized.replace(/[^a-z0-9\s]/g, '');

		// Trim whitespace
		normalized = normalized.trim();

		return normalized;
	}
}
