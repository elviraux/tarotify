/**
 * Response transformation utilities
 * Transforms snake_case API responses to camelCase TypeScript interfaces
 */
import type { ImageGenerationResponse, ImageTransformResponse } from '../types';
/**
 * API response format (snake_case from Newell API)
 */
interface ImageApiResponse {
    success: boolean;
    images?: string[];
    error?: string;
    model_used: string;
    project_id: string;
    usage: {
        images_generated?: number;
    };
    timestamp: string;
}
/**
 * Transform image generation API response to SDK format
 */
export declare function transformImageGenerationResponse(apiResponse: ImageApiResponse): ImageGenerationResponse;
/**
 * Transform image transformation API response to SDK format
 */
export declare function transformImageTransformResponse(apiResponse: ImageApiResponse): ImageTransformResponse;
export {};
//# sourceMappingURL=transform.d.ts.map