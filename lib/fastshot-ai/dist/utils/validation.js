import { NewellError, NewellErrorCode } from '../types/errors';
/**
 * Validates text generation parameters
 */
export function validateTextGeneration(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
        throw new NewellError('Prompt is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
    if (params.temperature !== undefined) {
        if (params.temperature < 0 || params.temperature > 2) {
            throw new NewellError('Temperature must be between 0.0 and 2.0', NewellErrorCode.VALIDATION_ERROR);
        }
    }
    if (params.maxTokens !== undefined) {
        if (params.maxTokens < 1 || params.maxTokens > 100000) {
            throw new NewellError('maxTokens must be between 1 and 100000', NewellErrorCode.VALIDATION_ERROR);
        }
    }
}
/**
 * Validates image analysis parameters
 */
export function validateImageAnalysis(params) {
    if (!params.imageUrl || params.imageUrl.trim().length === 0) {
        throw new NewellError('imageUrl is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
    if (!params.prompt || params.prompt.trim().length === 0) {
        throw new NewellError('Prompt is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
}
/**
 * Validates image generation parameters
 */
export function validateImageGeneration(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
        throw new NewellError('Prompt is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
    if (params.width !== undefined) {
        if (params.width < 128 || params.width > 2048) {
            throw new NewellError('Width must be between 128 and 2048 pixels', NewellErrorCode.VALIDATION_ERROR);
        }
    }
    if (params.height !== undefined) {
        if (params.height < 128 || params.height > 2048) {
            throw new NewellError('Height must be between 128 and 2048 pixels', NewellErrorCode.VALIDATION_ERROR);
        }
    }
    if (params.numOutputs !== undefined) {
        if (params.numOutputs < 1 || params.numOutputs > 4) {
            throw new NewellError('numOutputs must be between 1 and 4', NewellErrorCode.VALIDATION_ERROR);
        }
    }
}
/**
 * Validates image transformation parameters
 */
export function validateImageTransform(params) {
    if (!params.imageUrl || params.imageUrl.trim().length === 0) {
        throw new NewellError('imageUrl is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
    if (!params.prompt || params.prompt.trim().length === 0) {
        throw new NewellError('Prompt is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
    if (params.strength !== undefined) {
        if (params.strength < 0 || params.strength > 1) {
            throw new NewellError('Strength must be between 0.0 and 1.0', NewellErrorCode.VALIDATION_ERROR);
        }
    }
}
/**
 * Validates audio transcription parameters
 */
export function validateAudioTranscription(params) {
    if (!params.audioUri || params.audioUri.trim().length === 0) {
        throw new NewellError('audioUri is required and cannot be empty', NewellErrorCode.VALIDATION_ERROR);
    }
}
/**
 * Validates that project ID is configured
 */
export function validateProjectId(projectId) {
    if (!projectId || projectId.trim().length === 0) {
        throw new NewellError('Project ID is not configured. Set EXPO_PUBLIC_PROJECT_ID environment variable.', NewellErrorCode.VALIDATION_ERROR);
    }
}
