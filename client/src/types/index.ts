// client/src/types/index.ts
import { ReactNode, HTMLAttributes } from 'react';
import { LucideProps } from 'lucide-react';

export interface ModelState {
    uptime?: number;
    memory_usage?: { rss: number; vms: number };
    cpu_usage?: number;
}
  
export interface UseAsyncActionResult<T> {
    data: T | null;
    requestMetrics: any;
    performanceMetrics: any;
    execute: (...args: any[]) => Promise<T | null>;
}

// export interface UseAsyncActionResult<T> {
//   isLoading: boolean;
//   error: Error | null;
//   execute: (...args: any[]) => Promise<T | null>;
//   reset: () => void;
// }
  
export interface MessageCardProps extends HTMLAttributes<HTMLDivElement> {
    onRetry?: () => void;
    message: {
      content: string;
      timestamp: string;
      type: 'user' | 'assistant' | 'internal';
    };
}
  
export interface ChatMessage {
    id: string;
    message: string;
    timestamp: string;
}



export enum ModelStatus {
    INITIALIZING = "INITIALIZING",
    READY = "READY",
    ERROR = "ERROR",
    PROCESSING = "PROCESSING",
    STOPPED = "STOPPED"
}

export interface ModelSettings {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    stop_sequences: string[];
}

export interface ModelStatusResponse {
    status: ModelStatus;
    model_path: string | null;
    settings: ModelSettings | null;
    ready: boolean;
    uptime?: number;
    memory_usage?: number;
}

export interface Message {
    content: string;
    timestamp: string;
    type: 'user' | 'assistant' | 'internal';
}

export interface ChatResponse {
    response: string;
    tokens_used: number;
    finish_reason?: string;
}

export interface ApiError {
    error: string;
    code: string;
    details?: Record<string, any>;
    timestamp: string;
}