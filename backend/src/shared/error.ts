/**
 * Shared error classes for the Smart Kids Academy backend.
 *
 * These map directly to the HTTP status codes defined in backend-API-derivation.md:
 *   400  Bad Request        – ValidationError
 *   404  Not Found          – NotFoundError
 *   409  Conflict           – ConflictError  (invariant violations)
 *   422  Unprocessable      – UnprocessableError (enum / schema failures)
 */

import { Request } from "express";
import { logger } from "./observability/logger";

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
 * Logs the error through the structured logger.
 */
export function toErrorResponse(
    err: unknown,
    req?: Request
): { status: number; body: { error: string } } {
    let status = 500;
    let message = "Internal server error";
    let isAppError = false;

    if (err instanceof AppError) {
        status = err.statusCode;
        message = err.message;
        isAppError = true;
    }

    const payload = {
        requestId: req?.id,
        route: req ? `${req.method} ${req.originalUrl}` : undefined,
        statusCode: status,
        userId: req && req.user ? req.user.id : undefined,
    };

    if (isAppError && status < 500) {
        // AppError <500 are expected invariant violations / user mistakes
        logger.warn(message, payload);
    } else {
        // 500s or native Node errors are unexpected crashes
        const finalError = err instanceof Error ? err : new Error(String(err));
        logger.error(finalError.message, finalError, payload);
    }

    // Always sanitize outside API responses
    return { status, body: { error: message } };
}