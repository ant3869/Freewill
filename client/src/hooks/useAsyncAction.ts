// client/src/hooks/useAsyncAction.ts
import { useState, useCallback } from 'react';
// import type { UseAsyncActionResult } from '../types';

export interface UseAsyncActionResult<T> {
    execute: (...args: any[]) => Promise<T>;
    isLoading: boolean;
    error: string | null;
    data?: T;
}  

export function useAsyncAction<T>(action: (...args: any[]) => Promise<T>): UseAsyncActionResult<T> {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | undefined>(undefined);
  
    const execute = async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        setData(result);
        return result;
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  
    return { execute, isLoading, error, data };
  }

// export function useAsyncAction<T>(
//     action: (...args: any[]) => Promise<T>
//   ): UseAsyncActionResult<T> {
//     const [data, setData] = useState<T | null>(null);
//     const [requestMetrics, setRequestMetrics] = useState({});
//     const [performanceMetrics, setPerformanceMetrics] = useState({});
  
//     const execute = useCallback(async (...args: any[]) => {
//       try {
//         const result = await action(...args);
//         setData(result);
//         return result;
//       } catch (error) {
//         console.error(error);
//         return null;
//       }
//     }, [action]);
  
//     return { data, requestMetrics, performanceMetrics, execute };
//   }

// interface UseAsyncActionResult<T> {
//   isLoading: boolean;
//   error: Error | null;
//   execute: (...args: any[]) => Promise<T | null>;
//   reset: () => void;
// }

// export function useAsyncAction<T>(
//   action: (...args: any[]) => Promise<T>
// ): UseAsyncActionResult<T> {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const execute = useCallback(
//     async (...args: any[]) => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const result = await action(...args);
//         return result;
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('An error occurred'));
//         return null;
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [action]
//   );

//   const reset = useCallback(() => {
//     setIsLoading(false);
//     setError(null);
//   }, []);

//   return { isLoading, error, execute, reset };
// }