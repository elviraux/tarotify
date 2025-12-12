import type { TextGenerationParams, NewellError } from '../types';
/**
 * Options for useTextGeneration hook
 */
export interface UseTextGenerationOptions {
    /** Callback invoked on successful text generation */
    onSuccess?: (text: string) => void;
    /** Callback invoked on error */
    onError?: (error: NewellError) => void;
}
/**
 * Return type for useTextGeneration hook
 */
export interface UseTextGenerationReturn {
    /** Function to trigger text generation */
    generateText: (prompt: string, options?: Partial<TextGenerationParams>) => Promise<void>;
    /** Generated text (null if not yet generated) */
    data: string | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state (null if no error) */
    error: NewellError | null;
    /** Reset the hook state */
    reset: () => void;
}
/**
 * React hook for text generation with Newell AI
 *
 * @example
 * ```typescript
 * const { generateText, data, isLoading, error } = useTextGeneration({
 *   onSuccess: (text) => console.log('Generated:', text),
 * });
 *
 * // In your component
 * <Button onPress={() => generateText('Tell me a joke')} disabled={isLoading} />
 * {data && <Text>{data}</Text>}
 * ```
 */
export declare function useTextGeneration(options?: UseTextGenerationOptions): UseTextGenerationReturn;
//# sourceMappingURL=useTextGeneration.d.ts.map