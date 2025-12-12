import { RetryOptions } from '../types/errors';
/**
 * Executes a function with retry logic and exponential backoff
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Creates a timeout promise that rejects after the specified duration
 */
export declare function createTimeoutPromise(ms: number): Promise<never>;
/**
 * Wraps a promise with a timeout
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
//# sourceMappingURL=retry.d.ts.map