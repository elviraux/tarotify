import type { AudioTranscriptionParams, NewellError } from '../types';
/**
 * Options for useAudioTranscription hook
 */
export interface UseAudioTranscriptionOptions {
    /** Callback invoked on successful audio transcription */
    onSuccess?: (transcription: string) => void;
    /** Callback invoked on error */
    onError?: (error: NewellError) => void;
}
/**
 * Return type for useAudioTranscription hook
 */
export interface UseAudioTranscriptionReturn {
    /** Function to trigger audio transcription */
    transcribeAudio: (params: AudioTranscriptionParams) => Promise<void>;
    /** Transcription result (null if not yet transcribed) */
    data: string | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state (null if no error) */
    error: NewellError | null;
    /** Reset the hook state */
    reset: () => void;
}
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
export declare function useAudioTranscription(options?: UseAudioTranscriptionOptions): UseAudioTranscriptionReturn;
//# sourceMappingURL=useAudioTranscription.d.ts.map