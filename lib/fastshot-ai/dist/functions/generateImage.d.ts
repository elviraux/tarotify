import type { ImageGenerationParams, ImageGenerationResponse } from '../types';
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
export declare function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
//# sourceMappingURL=generateImage.d.ts.map