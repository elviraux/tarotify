/**
 * @fastshot/ai - Newell AI SDK for Expo React Native
 *
 * A comprehensive SDK for integrating Newell AI capabilities into your Expo apps.
 */
export { NewellClient } from './client/NewellClient';
export { configureNewell, getGlobalConfig, resetConfig } from './client/config';
export { generateText, analyzeImage, generateImage, transformImage, transcribeAudio, } from './functions';
export { useTextGeneration, useImageAnalysis, useImageGeneration, useImageTransform, useAudioTranscription, } from './hooks';
export type { NewellConfig, NewellClientOptions, TextGenerationParams, ImageAnalysisParams, ImageGenerationParams, ImageTransformParams, AudioTranscriptionParams, ImageGenerationResponse, ImageTransformResponse, RetryOptions, } from './types';
export type { UseTextGenerationOptions, UseTextGenerationReturn, } from './hooks/useTextGeneration';
export type { UseImageAnalysisOptions, UseImageAnalysisReturn, } from './hooks/useImageAnalysis';
export type { UseImageGenerationOptions, UseImageGenerationReturn, } from './hooks/useImageGeneration';
export type { UseImageTransformOptions, UseImageTransformReturn, } from './hooks/useImageTransform';
export type { UseAudioTranscriptionOptions, UseAudioTranscriptionReturn, } from './hooks/useAudioTranscription';
export { NewellError, NewellErrorCode } from './types/errors';
export { NEWELL_ENDPOINTS, DEFAULT_CONFIG, DEFAULT_MODELS, DEFAULT_PARAMS, } from './constants';
//# sourceMappingURL=index.d.ts.map