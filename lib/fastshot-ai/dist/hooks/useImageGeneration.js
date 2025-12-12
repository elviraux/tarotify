import { useState, useCallback } from 'react';
import { NewellClient } from '../client/NewellClient';
import { handleNewellError } from '../utils/errors';
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
export function useImageGeneration(options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const generateImage = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const client = new NewellClient();
            const result = await client.generateImage(params);
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
        generateImage,
        data,
        isLoading,
        error,
        reset,
    };
}
