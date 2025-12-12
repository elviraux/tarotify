import { NewellClient } from '../client/NewellClient';
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
export async function generateText(params) {
    const client = new NewellClient();
    return client.generateText(params);
}
