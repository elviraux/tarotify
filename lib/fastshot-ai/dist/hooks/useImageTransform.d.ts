import type { ImageTransformParams, ImageTransformResponse, NewellError } from '../types';
/**
 * Options for useImageTransform hook
 */
export interface UseImageTransformOptions {
    /** Callback invoked on successful image transformation */
    onSuccess?: (response: ImageTransformResponse) => void;
    /** Callback invoked on error */
    onError?: (error: NewellError) => void;
}
/**
 * Return type for useImageTransform hook
 */
export interface UseImageTransformReturn {
    /** Function to trigger image transformation */
    transformImage: (params: ImageTransformParams) => Promise<void>;
    /** Transformation result (null if not yet transformed) */
    data: ImageTransformResponse | null;
    /** Loading state (transformation typically takes 10-30 seconds) */
    isLoading: boolean;
    /** Error state (null if no error) */
    error: NewellError | null;
    /** Reset the hook state */
    reset: () => void;
}
/**
 * React hook for image transformation with Newell AI
 *
 * Note: Image transformation typically takes 10-30 seconds. Show a loading indicator.
 *
 * @example
 * ```typescript
 * const { transformImage, data, isLoading } = useImageTransform();
 *
 * // In your component
 * <Button
 *   onPress={() => transformImage({
 *     imageUrl: 'https://example.com/image.jpg',
 *     prompt: 'Make it look like a painting',
 *     strength: 0.8
 *   })}
 *   disabled={isLoading}
 * />
 * {isLoading && <ActivityIndicator />}
 * {data?.images && <Image source={{ uri: data.images[0] }} />}
 * ```
 */
export declare function useImageTransform(options?: UseImageTransformOptions): UseImageTransformReturn;
//# sourceMappingURL=useImageTransform.d.ts.map