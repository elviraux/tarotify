import { useState, useCallback } from 'react';
import { NewellClient } from '../client/NewellClient';
import { handleNewellError } from '../utils/errors';
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
export function useImageAnalysis(options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const analyzeImage = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const client = new NewellClient();
            const result = await client.analyzeImage(params);
            setData(result);
            options?.onSuccess?.(result);
        }
        catch (err) {
            const newellError = handleNewellError(err);
            setError(newellError);
            options?.onError?.(newellError);
        }
        finally {
            setIsLoading(false);
        }
    }, [options]);
    const reset = useCallback(() => {
        setData(null);
        setError(null);
    }, []);
    return {
        analyzeImage,
        data,
        isLoading,
        error,
        reset,
    };
}
