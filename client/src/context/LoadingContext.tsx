// client/src/context/LoadingContext.tsx
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

type LoadingAction = 
  | { type: 'START_LOADING'; payload: string }
  | { type: 'STOP_LOADING'; payload: string };

const LoadingContext = createContext<{
  state: LoadingState;
  dispatch: Dispatch<LoadingAction>;
}>({
  state: {},
  dispatch: () => null,
});

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, [action.payload]: true };
    case 'STOP_LOADING':
      return { ...state, [action.payload]: false };
    default:
      return state;
  }
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, {});

  return (
    <LoadingContext.Provider value={{ state, dispatch }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};