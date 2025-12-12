import { useState, useCallback } from 'react';
import { NewellClient } from '../client/NewellClient';
import { handleNewellError } from '../utils/errors';
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
export function useTextGeneration(options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const generateText = useCallback(async (prompt, customOptions) => {
        setIsLoading(true);
        setError(null);
        try {
            const client = new NewellClient();
            const result = await client.generateText({
                prompt,
                ...customOptions,
            });
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
        generateText,
        data,
        isLoading,
        error,
        reset,
    };
}
