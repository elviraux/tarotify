import type { ImageGenerationParams, ImageGenerationResponse, NewellError } from '../types';
/**
 * Options for useImageGeneration hook
 */
export interface UseImageGenerationOptions {
    /** Callback invoked on successful image generation */
    onSuccess?: (response: ImageGenerationResponse) => void;
    /** Callback invoked on error */
    onError?: (error: NewellError) => void;
}
/**
 * Return type for useImageGeneration hook
 */
export interface UseImageGenerationReturn {
    /** Function to trigger image generation */
    generateImage: (params: ImageGenerationParams) => Promise<void>;
    /** Generation result (null if not yet generated) */
    data: ImageGenerationResponse | null;
    /** Loading state (generation typically takes 10-30 seconds) */
    isLoading: boolean;
    /** Error state (null if no error) */
    error: NewellError | null;
    /** Reset the hook state */
    reset: () => void;
}
/**
 * React hook for image generation with Newell AI
 *
 * Note: Image generation typically takes 10-30 seconds. Show a loading indicator.
 *
 * @example
 * ```typescript
 * const { generateImage, data, isLoading } = useImageGeneration();
 *
 * // In your component
 * <Button
 *   onPress={() => generateImage({
 *     prompt: 'A futuristic cityscape',
 *     width: 1024,
 *     height: 1024
 *   })}
 *   disabled={isLoading}
 * />
 * {isLoading && <ActivityIndicator />}
 * {data?.images && <Image source={{ uri: data.images[0] }} />}
 * ```
 */
export declare function useImageGeneration(options?: UseImageGenerationOptions): UseImageGenerationReturn;
//# sourceMappingURL=useImageGeneration.d.ts.map