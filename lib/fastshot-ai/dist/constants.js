/**
 * Default API endpoints for Newell AI
 */
export const NEWELL_ENDPOINTS = {
    TEXT_GENERATION: '/v1/generate/text',
    IMAGE_ANALYSIS: '/v1/analyze/image',
    IMAGE_GENERATION: '/v1/generate/image',
    IMAGE_TRANSFORM: '/v1/transform/image',
    AUDIO_TRANSCRIPTION: '/v1/transcribe/audio',
};
/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
    API_URL: 'https://newell.fastshot.ai',
    MAX_RETRIES: 3,
    TIMEOUT: 60000, // 60 seconds
};
/**
 * Default model names
 */
export const DEFAULT_MODELS = {
    TEXT_GENERATION: 'gpt-4o-mini',
    IMAGE_ANALYSIS: 'gpt-4o',
    IMAGE_GENERATION: 'black-forest-labs/flux-schnell',
    IMAGE_TRANSFORM: 'black-forest-labs/flux-kontext-max',
    AUDIO_TRANSCRIPTION: 'whisper-1',
};
/**
 * Default parameter values
 */
export const DEFAULT_PARAMS = {
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7,
    INJECT_BRANDING: true,
    IMAGE_WIDTH: 1024,
    IMAGE_HEIGHT: 1024,
    NUM_OUTPUTS: 1,
    TRANSFORM_STRENGTH: 0.8,
};
