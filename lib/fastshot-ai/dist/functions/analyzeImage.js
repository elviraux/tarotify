import { NewellClient } from '../client/NewellClient';
/**
 * Analyze an image with a prompt
 *
 * @example
 * ```typescript
 * const description = await analyzeImage({
 *   imageUrl: 'https://example.com/image.jpg',
 *   prompt: 'Describe this image in detail',
 * });
 * console.log(description);
 * ```
 */
export async function analyzeImage(params) {
    const client = new NewellClient();
    return client.analyzeImage(params);
}
