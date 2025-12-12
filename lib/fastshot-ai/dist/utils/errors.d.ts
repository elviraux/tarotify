import { NewellError } from '../types/errors';
/**
 * Converts various error types into a NewellError
 */
export declare function handleNewellError(error: unknown): NewellError;
/**
 * Creates a NewellError from an HTTP response
 */
export declare function createErrorFromResponse(response: Response): Promise<NewellError>;
//# sourceMappingURL=errors.d.ts.map