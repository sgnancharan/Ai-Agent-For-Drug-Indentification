/**
 * MediGuide AI - Core Type Definitions
 */

export * from './medicine.ts';
export * from './agent.ts';

export interface ModelConnectionConfig {
  baseUrl: string;
  modelId: string;
  timeoutMs: number;
}

export type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'error';

export interface ModelHealthStatus {
  status: ConnectionStatus;
  modelId?: string;
  availableModels?: string[];
  latencyMs?: number;
  errorMessage?: string;
  checkedAt?: string;
}
