import type { ImageTransformParams, ImageTransformResponse } from '../types';
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
export declare function transformImage(params: ImageTransformParams): Promise<ImageTransformResponse>;
//# sourceMappingURL=transformImage.d.ts.map