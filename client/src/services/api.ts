// client/src/services/api.ts
import axios from 'axios';
import { ModelStatus, ModelSettings } from '../types';

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

export interface Memory {
  content: any;
  type: string;
  metadata?: Record<string, any>;
  importance?: number;
}

export interface SearchResult {
  memory_id: number;
  content: string;
  metadata: Record<string, any>;
  relevance: number;
}

const ApiService = {

  async startModel(modelPath: string) {
    const response = await api.post('/model/start', {
      model_path: modelPath
    });
    return response.data;
  },

  async stopModel() {
    const response = await api.post('/model/stop');
    return response.data;
  },

  async getModelStatus() {
    const response = await api.get('/model/status');
    return response.data;
  },

  async updateModelSettings(settings: Partial<ModelSettings>) {
    const response = await api.post('/model/settings', settings);
    return response.data;
  },

  async getSystemMetrics() {
    const response = await api.get('/metrics/system');
    return response.data;
  },

  // Chat endpoints
  async sendMessage(message: ChatMessage) {
    const response = await api.post('/chat/send', message);
    return response.data;
  },

  async getModelSettings() {
    const response = await api.get('/model/settings');
    return response.data;
  },

  async getRequestMetrics(timeRange: string): Promise<any> {
    const response = await api.get(`/metrics/requests?timeRange=${timeRange}`);
    return response.data;
  },
  
  async getPerformanceMetrics(timeRange: string): Promise<any> {
    const response = await api.get(`/metrics/performance?timeRange=${timeRange}`);
    return response.data;
  },

  // Memory endpoints
  async getMemories(type?: string, limit: number = 10) {
    const response = await api.get('/memory', {
      params: { type, limit }
    });
    return response.data.memories;
  },

  async getMemoryStats(timeRange: string): Promise<any> {
    const response = await api.get(`/memory/stats?timeRange=${timeRange}`);
    return response.data;
  },

  async searchMemories(query: string, filters: Record<string, any>): Promise<{ results: SearchResult[] }> {
    const response = await api.post('/memory/search', { query, filters });
    return response.data;
  },

  async storeMemory(memory: Memory) {
    const response = await api.post('/memory', memory);
    return response.data;
  }
};

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      return Promise.reject({ error: 'Network error occurred' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export default ApiService;