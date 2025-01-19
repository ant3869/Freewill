  // client/src/hooks/useLoading.ts
  import { useState, useCallback } from 'react';
  
  export function useLoading(initialState = false) {
    const [isLoading, setIsLoading] = useState(initialState);
    const [error, setError] = useState<ApiError | null>(null);
  
    const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await asyncFn();
        return result;
      } catch (err) {
        const apiError = ApiErrorHandler.handleError(err);
        setError(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    return { isLoading, error, withLoading };
  }