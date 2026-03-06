/**
 * Centralized structured logger for the application.
 */

export interface LogPayload {
    message: string;
    level: "INFO" | "WARN" | "ERROR";
    requestId?: string;
    userId?: string;
    route?: string;
    durationMs?: number;
    method?: string;
    statusCode?: number;
    stack?: string;
    [key: string]: unknown;
}

function printLog(payload: LogPayload) {
    const output = {
        timestamp: new Date().toISOString(),
        ...payload
    };

    // We stringify the payload for structured JSON logging expected in production
    if (payload.level === "ERROR") {
        console.error(JSON.stringify(output));
    } else if (payload.level === "WARN") {
        console.warn(JSON.stringify(output));
    } else {
        console.log(JSON.stringify(output));
    }
}

export const logger = {
    info: (message: string, meta?: Omit<LogPayload, "message" | "level">) => {
        printLog({ message, level: "INFO", ...meta });
    },
    warn: (message: string, meta?: Omit<LogPayload, "message" | "level">) => {
        printLog({ message, level: "WARN", ...meta });
    },
    error: (message: string, error?: Error, meta?: Omit<LogPayload, "message" | "level" | "stack">) => {
        printLog({
            message,
            level: "ERROR",
            stack: error?.stack,
            ...meta
        });
    }
};
