/**
 * Response transformation utilities
 * Transforms snake_case API responses to camelCase TypeScript interfaces
 */
/**
 * Transform image generation API response to SDK format
 */
export function transformImageGenerationResponse(apiResponse) {
    return {
        success: apiResponse.success,
        images: apiResponse.images,
        error: apiResponse.error,
        modelUsed: apiResponse.model_used,
        projectId: apiResponse.project_id,
        usage: {
            imagesGenerated: apiResponse.usage?.images_generated,
        },
        timestamp: apiResponse.timestamp,
    };
}
/**
 * Transform image transformation API response to SDK format
 */
export function transformImageTransformResponse(apiResponse) {
    return {
        success: apiResponse.success,
        images: apiResponse.images,
        error: apiResponse.error,
        modelUsed: apiResponse.model_used,
        projectId: apiResponse.project_id,
        usage: {
            imagesGenerated: apiResponse.usage?.images_generated,
        },
        timestamp: apiResponse.timestamp,
    };
}
