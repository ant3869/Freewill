// client/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface ChatMessage {
  content: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ModelSettings {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface Memory {
  content: any;
  type: string;
  metadata?: Record<string, any>;
  importance?: number;
}

const ApiService = {
  // Chat endpoints
  async sendMessage(message: ChatMessage) {
    const response = await api.post('/chat/send', message);
    return response.data;
  },

  // Model control endpoints
  async startModel(modelPath: string) {
    const response = await api.post('/model/control', {
      action: 'start',
      model_path: modelPath
    });
    return response.data;
  },

  async stopModel() {
    const response = await api.post('/model/control', {
      action: 'stop'
    });
    return response.data;
  },

  async getModelSettings() {
    const response = await api.get('/model/settings');
    return response.data;
  },

  async updateModelSettings(settings: Partial<ModelSettings>) {
    const response = await api.post('/model/settings', settings);
    return response.data;
  },

  // Memory endpoints
  async getMemories(type?: string, limit: number = 10) {
    const response = await api.get('/memory', {
      params: { type, limit }
    });
    return response.data.memories;
  },

  async storeMemory(memory: Memory) {
    const response = await api.post('/memory', memory);
    return response.data;
  }
};

export default ApiService;