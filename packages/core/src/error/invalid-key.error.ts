export class InvalidKeyError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidKeyError';
		Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
	}
}
