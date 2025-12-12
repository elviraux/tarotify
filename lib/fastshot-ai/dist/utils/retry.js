import { NewellError, NewellErrorCode } from '../types/errors';
/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: (error) => {
        // Don't retry project validation errors (403)
        if (error instanceof NewellError &&
            error.code === NewellErrorCode.PROJECT_VALIDATION_FAILED) {
            return false;
        }
        // Don't retry client validation errors (4xx)
        if (error instanceof NewellError &&
            error.code === NewellErrorCode.VALIDATION_ERROR) {
            return false;
        }
        // Retry network errors, timeouts, and server errors
        return true;
    },
};
/**
 * Executes a function with retry logic and exponential backoff
 */
export async function withRetry(fn, options = {}) {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError;
    for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Check if we should retry this error
            if (!opts.shouldRetry(error) || attempt === opts.maxRetries - 1) {
                throw error;
            }
            // Calculate delay with exponential backoff: 1s, 2s, 4s, ...
            const delay = opts.baseDelay * Math.pow(2, attempt);
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    // This should never be reached, but TypeScript needs it
    throw lastError;
}
/**
 * Creates a timeout promise that rejects after the specified duration
 */
export function createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new NewellError(`Request timeout after ${ms}ms`, NewellErrorCode.TIMEOUT_ERROR));
        }, ms);
    });
}
/**
 * Wraps a promise with a timeout
 */
export async function withTimeout(promise, timeoutMs) {
    return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
}
