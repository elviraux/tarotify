import { NewellError, NewellErrorCode } from '../types/errors';
/**
 * Converts various error types into a NewellError
 */
export function handleNewellError(error) {
    // Already a NewellError
    if (error instanceof NewellError) {
        return error;
    }
    // Network/fetch errors
    if (error instanceof Error) {
        // SSL/TLS certificate errors
        if (error.message.includes('certificate') ||
            error.message.includes('TLS') ||
            error.message.includes('SSL') ||
            error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
            return new NewellError(`SSL certificate error: ${error.message}. This may indicate a certificate mismatch or expired certificate.`, NewellErrorCode.NETWORK_ERROR, undefined, error);
        }
        if (error.message.includes('fetch') || error.message.includes('network')) {
            return new NewellError('Network error. Please check your connection.', NewellErrorCode.NETWORK_ERROR, undefined, error);
        }
        if (error.message.includes('timeout')) {
            return new NewellError('Request timeout. Please try again.', NewellErrorCode.TIMEOUT_ERROR, undefined, error);
        }
    }
    // Unknown error
    return new NewellError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`, NewellErrorCode.UNKNOWN_ERROR, undefined, error);
}
/**
 * Creates a NewellError from an HTTP response
 */
export async function createErrorFromResponse(response) {
    const statusCode = response.status;
    // Project validation failed
    if (statusCode === 403) {
        return new NewellError('Project validation failed. Please check your PROJECT_ID.', NewellErrorCode.PROJECT_VALIDATION_FAILED, statusCode);
    }
    // Try to get error message from response
    let message = `API error: ${statusCode}`;
    try {
        const data = await response.json();
        if (data.error) {
            message = data.error;
        }
        else if (data.detail) {
            message = data.detail;
        }
    }
    catch (e) {
        // If we can't parse JSON, try to get text
        try {
            const text = await response.text();
            if (text) {
                message = `API error: ${statusCode} - ${text}`;
            }
        }
        catch {
            // If we can't parse anything, use default message
        }
    }
    // Client errors (4xx)
    if (statusCode >= 400 && statusCode < 500) {
        return new NewellError(message, NewellErrorCode.VALIDATION_ERROR, statusCode);
    }
    // Server errors (5xx)
    return new NewellError(message, NewellErrorCode.API_ERROR, statusCode);
}
