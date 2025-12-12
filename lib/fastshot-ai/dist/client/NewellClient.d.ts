import type { NewellClientOptions, TextGenerationParams, ImageAnalysisParams, ImageGenerationParams, ImageTransformParams, AudioTranscriptionParams, ImageGenerationResponse, ImageTransformResponse } from '../types';
/**
 * Core client for interacting with Newell AI API
 */
export declare class NewellClient {
    private config;
    constructor(options?: Partial<NewellClientOptions>);
    /**
     * Core request method with retry logic and timeout
     */
    private request;
    /**
     * Generate text from a prompt
     */
    generateText(params: TextGenerationParams): Promise<string>;
    /**
     * Analyze an image with a prompt
     */
    analyzeImage(params: ImageAnalysisParams): Promise<string>;
    /**
     * Generate an image from a prompt
     */
    generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
    /**
     * Transform an image using a prompt
     */
    transformImage(params: ImageTransformParams): Promise<ImageTransformResponse>;
    /**
     * Transcribe audio to text
     * Uses multipart/form-data as required by the Newell API
     */
    transcribeAudio(params: AudioTranscriptionParams): Promise<string>;
}
//# sourceMappingURL=NewellClient.d.ts.map