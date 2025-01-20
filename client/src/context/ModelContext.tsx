// client/src/context/ModelContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ModelSettings, ModelStatus } from '../types';
import ApiService from '../services/api';

interface ModelState {
  status: ModelStatus;
  settings: ModelSettings;
  isInitialized: boolean;
  error: string | null;
}

type ModelAction = 
  | { type: 'SET_STATUS'; payload: ModelStatus }
  | { type: 'UPDATE_SETTINGS'; payload: ModelSettings }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIALIZED'; payload: boolean };

const initialState: ModelState = {
  status: ModelStatus.STOPPED,
  settings: {
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop_sequences: []
  },
  isInitialized: false,
  error: null
};

const ModelContext = createContext<{
  state: ModelState;
  updateSettings: (settings: ModelSettings) => Promise<void>;
  refreshStatus: () => Promise<void>;
}>({
  state: initialState,
  updateSettings: async () => {},
  refreshStatus: async () => {}
});

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer((state: ModelState, action: ModelAction): ModelState => {
    switch (action.type) {
      case 'SET_STATUS':
        return { ...state, status: action.payload };
      case 'UPDATE_SETTINGS':
        return { ...state, settings: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      case 'CLEAR_ERROR':
        return { ...state, error: null };
      case 'SET_INITIALIZED':
        return { ...state, isInitialized: action.payload };
      default:
        return state;
    }
  }, initialState);

  const updateSettings = async (settings: ModelSettings) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await ApiService.updateModelSettings(settings);
      dispatch({ type: 'UPDATE_SETTINGS', payload: response.settings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update settings' });
    }
  };

  const refreshStatus = async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const status = await ApiService.getModelStatus();
      dispatch({ type: 'SET_STATUS', payload: status.status });
      if (status.settings) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: status.settings });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch model status' });
    }
  };

  useEffect(() => {
    // Initial status check
    refreshStatus();
  }, []);

  return (
    <ModelContext.Provider value={{ state, updateSettings, refreshStatus }}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};