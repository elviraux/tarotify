import type { ImageAnalysisParams } from '../types';
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
export declare function analyzeImage(params: ImageAnalysisParams): Promise<string>;
//# sourceMappingURL=analyzeImage.d.ts.map