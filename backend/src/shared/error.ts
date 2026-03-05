/**
 * Shared error classes for the Smart Kids Academy backend.
 *
 * These map directly to the HTTP status codes defined in backend-API-derivation.md:
 *   400  Bad Request        – ValidationError
 *   404  Not Found          – NotFoundError
 *   409  Conflict           – ConflictError  (invariant violations)
 *   422  Unprocessable      – UnprocessableError (enum / schema failures)
 */

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        // Maintains proper prototype chain in transpiled ES5
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/** 400 – Malformed request body, missing required fields */
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

/** 404 – Resource does not exist */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: unknown) {
        super(id ? `${resource} '${String(id)}' not found` : `${resource} not found`, 404);
    }
}

/** 409 – Business invariant violated (e.g. duplicate class, duplicate ledger) */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

/** 422 – Request is structurally valid but semantically invalid (bad enum, inactive student) */
export class UnprocessableError extends AppError {
    constructor(message: string) {
        super(message, 422);
    }
}

/**
 * Express error-response helper.
 * Converts any AppError into a consistent JSON response shape.
 * For unknown errors it returns 500 without leaking internals.
 */
export function toErrorResponse(err: unknown): { status: number; body: { error: string } } {
    if (err instanceof AppError) {
        return { status: err.statusCode, body: { error: err.message } };
    }
    console.error("[UnhandledError]", err);
    return { status: 500, body: { error: "Internal server error" } };
}