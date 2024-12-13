export class InvalidDataError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidDataError';
		Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
	}
}
