import { NewellClient } from '../client/NewellClient';
/**
 * Transform an image using a prompt
 *
 * @example
 * ```typescript
 * const result = await transformImage({
 *   imageUrl: 'https://example.com/image.jpg',
 *   prompt: 'Make it look like a painting',
 *   strength: 0.8,
 * });
 * console.log(result.images);
 * ```
 */
export async function transformImage(params) {
    const client = new NewellClient();
    return client.transformImage(params);
}
