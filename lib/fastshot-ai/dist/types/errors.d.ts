/**
 * Error codes for Newell AI API operations
 */
export declare enum NewellErrorCode {
    /** Network connection error */
    NETWORK_ERROR = "NETWORK_ERROR",
    /** Input validation failed */
    VALIDATION_ERROR = "VALIDATION_ERROR",
    /** Project ID validation failed (403) */
    PROJECT_VALIDATION_FAILED = "PROJECT_VALIDATION_FAILED",
    /** API returned an error response */
    API_ERROR = "API_ERROR",
    /** Request timeout */
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    /** File size exceeds limit */
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    /** Unknown or unexpected error */
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/**
 * Custom error class for Newell AI operations
 */
export declare class NewellError extends Error {
    code: NewellErrorCode;
    statusCode?: number | undefined;
    originalError?: unknown | undefined;
    constructor(message: string, code: NewellErrorCode, statusCode?: number | undefined, originalError?: unknown | undefined);
}
/**
 * Options for retry logic
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** Base delay in milliseconds for exponential backoff */
    baseDelay?: number;
    /** Function to determine if error should be retried */
    shouldRetry?: (error: unknown) => boolean;
}
//# sourceMappingURL=errors.d.ts.map