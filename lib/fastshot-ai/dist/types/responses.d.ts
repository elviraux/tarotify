/**
 * Response from image generation endpoint
 */
export interface ImageGenerationResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Array of generated image URLs (if successful) */
    images?: string[];
    /** Error message (if unsuccessful) */
    error?: string;
    /** The model that was used for generation */
    modelUsed: string;
    /** Project ID that made the request */
    projectId: string;
    /** Usage statistics */
    usage: {
        /** Number of images generated */
        imagesGenerated?: number;
    };
    /** ISO timestamp of the operation */
    timestamp: string;
}
/**
 * Response from image transformation endpoint
 */
export interface ImageTransformResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Array of transformed image URLs (if successful) */
    images?: string[];
    /** Error message (if unsuccessful) */
    error?: string;
    /** The model that was used for transformation */
    modelUsed: string;
    /** Project ID that made the request */
    projectId: string;
    /** Usage statistics */
    usage: {
        /** Number of images generated */
        imagesGenerated?: number;
    };
    /** ISO timestamp of the operation */
    timestamp: string;
}
//# sourceMappingURL=responses.d.ts.map