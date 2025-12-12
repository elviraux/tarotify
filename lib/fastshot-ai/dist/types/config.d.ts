/**
 * Configuration options for the Newell client
 */
export interface NewellConfig {
    /** Base URL for the Newell API */
    apiUrl: string;
    /** Project ID for validation */
    projectId: string;
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Request timeout in milliseconds */
    timeout: number;
}
/**
 * Options for creating a Newell client instance
 */
export interface NewellClientOptions {
    /** Base URL for the Newell API (default: env EXPO_PUBLIC_NEWELL_API_URL) */
    apiUrl?: string;
    /** Project ID for validation (default: env EXPO_PUBLIC_PROJECT_ID) */
    projectId?: string;
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Request timeout in milliseconds (default: 60000) */
    timeout?: number;
}
//# sourceMappingURL=config.d.ts.map