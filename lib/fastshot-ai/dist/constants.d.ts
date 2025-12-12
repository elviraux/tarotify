/**
 * Default API endpoints for Newell AI
 */
export declare const NEWELL_ENDPOINTS: {
    readonly TEXT_GENERATION: "/v1/generate/text";
    readonly IMAGE_ANALYSIS: "/v1/analyze/image";
    readonly IMAGE_GENERATION: "/v1/generate/image";
    readonly IMAGE_TRANSFORM: "/v1/transform/image";
    readonly AUDIO_TRANSCRIPTION: "/v1/transcribe/audio";
};
/**
 * Default configuration values
 */
export declare const DEFAULT_CONFIG: {
    readonly API_URL: "https://newell.fastshot.ai";
    readonly MAX_RETRIES: 3;
    readonly TIMEOUT: 60000;
};
/**
 * Default model names
 */
export declare const DEFAULT_MODELS: {
    readonly TEXT_GENERATION: "gpt-4o-mini";
    readonly IMAGE_ANALYSIS: "gpt-4o";
    readonly IMAGE_GENERATION: "black-forest-labs/flux-schnell";
    readonly IMAGE_TRANSFORM: "black-forest-labs/flux-kontext-max";
    readonly AUDIO_TRANSCRIPTION: "whisper-1";
};
/**
 * Default parameter values
 */
export declare const DEFAULT_PARAMS: {
    readonly MAX_TOKENS: 500;
    readonly TEMPERATURE: 0.7;
    readonly INJECT_BRANDING: true;
    readonly IMAGE_WIDTH: 1024;
    readonly IMAGE_HEIGHT: 1024;
    readonly NUM_OUTPUTS: 1;
    readonly TRANSFORM_STRENGTH: 0.8;
};
//# sourceMappingURL=constants.d.ts.map