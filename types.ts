
export type FileType = 'folder' | 'file';

export type ChatMode = 'code' | 'chat';

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  language?: string;
  isOpen?: boolean;
  parentId?: string;
}

export interface ThoughtStep {
  id: string;
  status: 'done' | 'loading' | 'pending';
  message: string;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: ThoughtStep[];
  timestamp: Date;
  mode?: ChatMode;
  isCode?: boolean;
  hasCode?: boolean; // For chat mode code canvas
}

export interface EngineLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'EXEC' | 'READY' | 'ERROR';
  message: string;
}

export enum AppMode {
  BUILDER = 'builder',
  DASHBOARD = 'dashboard'
}

export interface ResourceMetrics {
  cpu: number;
  gpu: number;
  vramUsed: number;
  vramTotal: number;
  throughput: number;
  latency: number;
  gpuTemp?: number;
  gpuPower?: number;
  ramUsed?: number;
  ramTotal?: number;
  gpuAvailable?: boolean;
}

export interface APIConfig {
  provider: 'local' | 'openai' | 'anthropic' | 'gemini' | 'nvidia';
  apiKey?: string;
  model?: string;
  enabled: boolean;
}

export interface TokenUsage {
  used: number;
  limit: number;
  cost: number;
  resetDate?: Date;
}
