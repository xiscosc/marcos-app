export class InvalidSizeError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidSizeError';
		Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
	}
}
