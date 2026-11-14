/* eslint-disable @typescript-eslint/no-magic-numbers */
export const BAD_REQUEST = 400;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const SERVER_ERROR = 500;
/* eslint-enable @typescript-eslint/no-magic-numbers */

export class InventoryError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}
