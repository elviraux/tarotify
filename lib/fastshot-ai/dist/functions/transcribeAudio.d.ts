import type { AudioTranscriptionParams } from '../types';
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
export declare function transcribeAudio(params: AudioTranscriptionParams): Promise<string>;
//# sourceMappingURL=transcribeAudio.d.ts.map