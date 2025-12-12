import type { TextGenerationParams } from '../types';
/**
 * Generate text from a prompt
 *
 * @example
 * ```typescript
 * const response = await generateText({
 *   prompt: 'Tell me a joke',
 *   temperature: 0.7,
 * });
 * console.log(response);
 * ```
 */
export declare function generateText(params: TextGenerationParams): Promise<string>;
//# sourceMappingURL=generateText.d.ts.map