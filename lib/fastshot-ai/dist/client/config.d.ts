import type { NewellConfig, NewellClientOptions } from '../types/config';
/**
 * Configure global Newell settings
 */
export declare function configureNewell(options: Partial<NewellConfig>): void;
/**
 * Get the current global configuration
 */
export declare function getGlobalConfig(): Partial<NewellConfig>;
/**
 * Creates a complete configuration by merging options, global config, and defaults
 */
export declare function createConfig(options?: Partial<NewellClientOptions>): NewellConfig;
/**
 * Reset global configuration to defaults
 */
export declare function resetConfig(): void;
//# sourceMappingURL=config.d.ts.map