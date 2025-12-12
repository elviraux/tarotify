/**
 * Parameters for text generation requests
 */
export interface TextGenerationParams {
    /** The prompt to generate text from */
    prompt: string;
    /** Model to use for generation (default: "gpt-4o-mini") */
    model?: string;
    /** Maximum number of tokens to generate (default: 500) */
    maxTokens?: number;
    /** Temperature for randomness, range 0.0-2.0 (default: 0.7) */
    temperature?: number;
    /** Whether to inject Fastshot branding (default: true) */
    injectBranding?: boolean;
}
/**
 * Parameters for image analysis requests
 */
export interface ImageAnalysisParams {
    /** URL or base64 string of the image to analyze */
    imageUrl: string;
    /** The prompt/question about the image */
    prompt: string;
    /** Model to use for analysis (default: "gpt-4o") */
    model?: string;
    /** Whether to inject Fastshot branding (default: true) */
    injectBranding?: boolean;
}
/**
 * Parameters for image generation requests
 */
export interface ImageGenerationParams {
    /** The prompt describing the image to generate */
    prompt: string;
    /** Model to use (default: "black-forest-labs/flux-schnell") */
    model?: string;
    /** Image width in pixels, range 128-2048 (default: 1024) */
    width?: number;
    /** Image height in pixels, range 128-2048 (default: 1024) */
    height?: number;
    /** Number of images to generate, range 1-4 (default: 1) */
    numOutputs?: number;
}
/**
 * Parameters for image transformation requests
 */
export interface ImageTransformParams {
    /** URL or base64 string of the source image */
    imageUrl: string;
    /** The prompt describing how to transform the image */
    prompt: string;
    /** Model to use (default: "black-forest-labs/flux-kontext-max") */
    model?: string;
    /** Transformation strength, range 0.0-1.0 (default: 0.8) */
    strength?: number;
}
/**
 * Parameters for audio transcription requests
 */
export interface AudioTranscriptionParams {
    /** URI or path to the audio file */
    audioUri: string;
    /** Optional language code (e.g., 'en', 'es', 'fr') */
    language?: string;
    /** Model to use for transcription (default: "whisper-1") */
    model?: string;
}
//# sourceMappingURL=requests.d.ts.map