import { useState, useCallback } from 'react';
import { NewellClient } from '../client/NewellClient';
import { handleNewellError } from '../utils/errors';
/**
 * React hook for audio transcription with Newell AI
 *
 * @example
 * ```typescript
 * const { transcribeAudio, data, isLoading } = useAudioTranscription();
 *
 * // In your component
 * <Button
 *   onPress={() => transcribeAudio({
 *     audioUri: 'file:///path/to/audio.m4a',
 *     language: 'en'
 *   })}
 *   disabled={isLoading}
 * />
 * {data && <Text>{data}</Text>}
 * ```
 */
export function useAudioTranscription(options) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const transcribeAudio = useCallback(async (params) => {
        setIsLoading(true);
        setError(null);
        try {
            const client = new NewellClient();
            const result = await client.transcribeAudio(params);
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
        transcribeAudio,
        data,
        isLoading,
        error,
        reset,
    };
}
