import { DEFAULT_CONFIG } from '../constants';
/**
 * Global configuration state (can be overridden per client)
 */
let globalConfig = {};
/**
 * Configure global Newell settings
 */
export function configureNewell(options) {
    globalConfig = { ...globalConfig, ...options };
}
/**
 * Get the current global configuration
 */
export function getGlobalConfig() {
    return { ...globalConfig };
}
/**
 * Creates a complete configuration by merging options, global config, and defaults
 */
export function createConfig(options) {
    // Priority: options > global config > environment variables > defaults
    return {
        apiUrl: options?.apiUrl ||
            globalConfig.apiUrl ||
            process.env.EXPO_PUBLIC_NEWELL_API_URL ||
            DEFAULT_CONFIG.API_URL,
        projectId: options?.projectId ||
            globalConfig.projectId ||
            process.env.EXPO_PUBLIC_PROJECT_ID ||
            '',
        maxRetries: options?.maxRetries ??
            globalConfig.maxRetries ??
            DEFAULT_CONFIG.MAX_RETRIES,
        timeout: options?.timeout ?? globalConfig.timeout ?? DEFAULT_CONFIG.TIMEOUT,
    };
}
/**
 * Reset global configuration to defaults
 */
export function resetConfig() {
    globalConfig = {};
}
