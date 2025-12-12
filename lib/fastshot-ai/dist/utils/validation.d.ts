import type { TextGenerationParams, ImageAnalysisParams, ImageGenerationParams, ImageTransformParams, AudioTranscriptionParams } from '../types/requests';
/**
 * Validates text generation parameters
 */
export declare function validateTextGeneration(params: TextGenerationParams): void;
/**
 * Validates image analysis parameters
 */
export declare function validateImageAnalysis(params: ImageAnalysisParams): void;
/**
 * Validates image generation parameters
 */
export declare function validateImageGeneration(params: ImageGenerationParams): void;
/**
 * Validates image transformation parameters
 */
export declare function validateImageTransform(params: ImageTransformParams): void;
/**
 * Validates audio transcription parameters
 */
export declare function validateAudioTranscription(params: AudioTranscriptionParams): void;
/**
 * Validates that project ID is configured
 */
export declare function validateProjectId(projectId: string): void;
//# sourceMappingURL=validation.d.ts.map