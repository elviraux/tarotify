import { useState, useCallback } from 'react';
import { NewellClient } from '../client/NewellClient';
import { handleNewellError } from '../utils/errors';
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
export function useImageTransform(options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const transformImage = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const client = new NewellClient();
            const result = await client.transformImage(params);
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
        transformImage,
        data,
        isLoading,
        error,
        reset,
    };
}
