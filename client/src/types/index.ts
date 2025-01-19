// client/src/types/index.ts
export enum ModelStatus {
    INITIALIZING = "INITIALIZING",
    READY = "READY",
    ERROR = "ERROR",
    PROCESSING = "PROCESSING",
    STOPPED = "STOPPED"
}

export interface ModelSettings {
    temperature: number;
    top_p: number;
    max_tokens: number;
    frequency_penalty: number;
    presence_penalty: number;
    stop_sequences: string[];
}

export interface Message {
    content: string;
    timestamp: string;
    type: 'user' | 'assistant' | 'internal';
}

export interface Memory {
    id: string;
    title: string;
    content: string;
    timestamp: string;
}