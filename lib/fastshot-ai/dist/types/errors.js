/**
 * Error codes for Newell AI API operations
 */
export var NewellErrorCode;
(function (NewellErrorCode) {
    /** Network connection error */
    NewellErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    /** Input validation failed */
    NewellErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    /** Project ID validation failed (403) */
    NewellErrorCode["PROJECT_VALIDATION_FAILED"] = "PROJECT_VALIDATION_FAILED";
    /** API returned an error response */
    NewellErrorCode["API_ERROR"] = "API_ERROR";
    /** Request timeout */
    NewellErrorCode["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    /** File size exceeds limit */
    NewellErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    /** Unknown or unexpected error */
    NewellErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(NewellErrorCode || (NewellErrorCode = {}));
/**
 * Custom error class for Newell AI operations
 */
export class NewellError extends Error {
    constructor(message, code, statusCode, originalError) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'NewellError';
        Object.setPrototypeOf(this, NewellError.prototype);
    }
}
