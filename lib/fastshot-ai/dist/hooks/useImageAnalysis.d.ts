import type { ImageAnalysisParams, NewellError } from '../types';
/**
 * Options for useImageAnalysis hook
 */
export interface UseImageAnalysisOptions {
    /** Callback invoked on successful image analysis */
    onSuccess?: (description: string) => void;
    /** Callback invoked on error */
    onError?: (error: NewellError) => void;
}
/**
 * Return type for useImageAnalysis hook
 */
export interface UseImageAnalysisReturn {
    /** Function to trigger image analysis */
    analyzeImage: (params: ImageAnalysisParams) => Promise<void>;
    /** Analysis result (null if not yet analyzed) */
    data: string | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state (null if no error) */
    error: NewellError | null;
    /** Reset the hook state */
    reset: () => void;
}
/**
 * React hook for image analysis with Newell AI
 *
 * @example
 * ```typescript
 * const { analyzeImage, data, isLoading } = useImageAnalysis();
 *
 * // In your component
 * <Button
 *   onPress={() => analyzeImage({
 *     imageUrl: 'https://example.com/image.jpg',
 *     prompt: 'Describe this image'
 *   })}
 *   disabled={isLoading}
 * />
 * {data && <Text>{data}</Text>}
 * ```
 */
export declare function useImageAnalysis(options?: UseImageAnalysisOptions): UseImageAnalysisReturn;
//# sourceMappingURL=useImageAnalysis.d.ts.map