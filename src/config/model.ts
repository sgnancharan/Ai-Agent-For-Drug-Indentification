import { ModelConnectionConfig } from '@/types';

/**
 * Local LM Studio model and endpoint configuration.
 * Configured for MedGemma 4B IT GGUF on local loopback.
 */
export const MODEL_CONFIG: ModelConnectionConfig = {
  baseUrl: process.env.LM_STUDIO_BASE_URL || process.env.NEXT_PUBLIC_LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234/v1',
  modelId: process.env.LM_STUDIO_MODEL || 'medgemma-4b-it',
  timeoutMs: 30000,
};
