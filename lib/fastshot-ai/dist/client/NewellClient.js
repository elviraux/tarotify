import { createConfig } from './config';
import { NEWELL_ENDPOINTS, DEFAULT_MODELS, DEFAULT_PARAMS } from '../constants';
import { withRetry, withTimeout } from '../utils/retry';
import { handleNewellError, createErrorFromResponse } from '../utils/errors';
import { validateTextGeneration, validateImageAnalysis, validateImageGeneration, validateImageTransform, validateAudioTranscription, validateProjectId, } from '../utils/validation';
import { transformImageGenerationResponse, transformImageTransformResponse, } from '../utils/transform';
/**
 * Core client for interacting with Newell AI API
 */
export class NewellClient {
    constructor(options) {
        this.config = createConfig(options);
    }
    /**
     * Core request method with retry logic and timeout
     */
    async request(endpoint, body) {
        validateProjectId(this.config.projectId);
        const url = `${this.config.apiUrl}${endpoint}`;
        const makeRequest = async () => {
            const fetchPromise = fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: this.config.projectId,
                    ...body,
                }),
            });
            const response = await withTimeout(fetchPromise, this.config.timeout);
            if (!response.ok) {
                throw await createErrorFromResponse(response);
            }
            // For text responses (text generation, image analysis, audio transcription)
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('text/plain')) {
                return (await response.text());
            }
            // For JSON responses (image generation, image transformation)
            return (await response.json());
        };
        try {
            return await withRetry(makeRequest, {
                maxRetries: this.config.maxRetries,
            });
        }
        catch (error) {
            throw handleNewellError(error);
        }
    }
    /**
     * Generate text from a prompt
     */
    async generateText(params) {
        validateTextGeneration(params);
        return this.request(NEWELL_ENDPOINTS.TEXT_GENERATION, {
            prompt: params.prompt,
            model: params.model || DEFAULT_MODELS.TEXT_GENERATION,
            max_tokens: params.maxTokens ?? DEFAULT_PARAMS.MAX_TOKENS,
            temperature: params.temperature ?? DEFAULT_PARAMS.TEMPERATURE,
            inject_branding: params.injectBranding ?? DEFAULT_PARAMS.INJECT_BRANDING,
        });
    }
    /**
     * Analyze an image with a prompt
     */
    async analyzeImage(params) {
        validateImageAnalysis(params);
        return this.request(NEWELL_ENDPOINTS.IMAGE_ANALYSIS, {
            image_url: params.imageUrl,
            prompt: params.prompt,
            model: params.model || DEFAULT_MODELS.IMAGE_ANALYSIS,
            inject_branding: params.injectBranding ?? DEFAULT_PARAMS.INJECT_BRANDING,
        });
    }
    /**
     * Generate an image from a prompt
     */
    async generateImage(params) {
        validateImageGeneration(params);
        const apiResponse = await this.request(NEWELL_ENDPOINTS.IMAGE_GENERATION, {
            prompt: params.prompt,
            model: params.model || DEFAULT_MODELS.IMAGE_GENERATION,
            width: params.width ?? DEFAULT_PARAMS.IMAGE_WIDTH,
            height: params.height ?? DEFAULT_PARAMS.IMAGE_HEIGHT,
            num_outputs: params.numOutputs ?? DEFAULT_PARAMS.NUM_OUTPUTS,
        });
        return transformImageGenerationResponse(apiResponse);
    }
    /**
     * Transform an image using a prompt
     */
    async transformImage(params) {
        validateImageTransform(params);
        const apiResponse = await this.request(NEWELL_ENDPOINTS.IMAGE_TRANSFORM, {
            image_url: params.imageUrl,
            prompt: params.prompt,
            model: params.model || DEFAULT_MODELS.IMAGE_TRANSFORM,
            strength: params.strength ?? DEFAULT_PARAMS.TRANSFORM_STRENGTH,
        });
        return transformImageTransformResponse(apiResponse);
    }
    /**
     * Transcribe audio to text
     * Uses multipart/form-data as required by the Newell API
     */
    async transcribeAudio(params) {
        validateAudioTranscription(params);
        validateProjectId(this.config.projectId);
        const url = `${this.config.apiUrl}${NEWELL_ENDPOINTS.AUDIO_TRANSCRIPTION}`;
        const makeRequest = async () => {
            // Create FormData for multipart upload
            const formData = new FormData();
            // Fetch audio file and convert to blob
            const audioResponse = await fetch(params.audioUri);
            const audioBlob = await audioResponse.blob();
            // Append audio file and parameters
            formData.append('audio', audioBlob, 'recording.m4a');
            formData.append('project_id', this.config.projectId);
            // Optional parameters
            if (params.language) {
                formData.append('language', params.language);
            }
            formData.append('model', params.model || DEFAULT_MODELS.AUDIO_TRANSCRIPTION);
            // Make request - Don't set Content-Type header, FormData sets it with boundary
            const fetchPromise = fetch(url, {
                method: 'POST',
                body: formData,
            });
            const response = await withTimeout(fetchPromise, this.config.timeout);
            if (!response.ok) {
                throw await createErrorFromResponse(response);
            }
            // Response is plain text, not JSON
            const transcription = await response.text();
            return transcription.trim();
        };
        try {
            return await withRetry(makeRequest, {
                maxRetries: this.config.maxRetries,
            });
        }
        catch (error) {
            throw handleNewellError(error);
        }
    }
}
