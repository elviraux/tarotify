import { NewellClient } from '../client/NewellClient';
/**
 * Transcribe audio to text
 *
 * @example
 * ```typescript
 * const transcription = await transcribeAudio({
 *   audioUri: 'file:///path/to/audio.m4a',
 *   language: 'en',
 * });
 * console.log(transcription);
 * ```
 */
export async function transcribeAudio(params) {
    const client = new NewellClient();
    return client.transcribeAudio(params);
}
