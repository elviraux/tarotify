import { NewellClient } from '../client/NewellClient';
/**
 * Generate an image from a prompt
 *
 * @example
 * ```typescript
 * const result = await generateImage({
 *   prompt: 'A futuristic cityscape at sunset',
 *   width: 1024,
 *   height: 1024,
 * });
 * console.log(result.images);
 * ```
 */
export async function generateImage(params) {
    const client = new NewellClient();
    return client.generateImage(params);
}
