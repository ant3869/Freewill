// client/src/services/errorHandler.ts
export interface ApiError {
    error: string;
    message: string;
    code: string;
    details?: Record<string, any>;
  }
  
  export class ApiErrorHandler {
    static isApiError(error: any): error is ApiError {
      return error && 'code' in error && 'message' in error;
    }
  
    static handleError(error: any): ApiError {
      if (this.isApiError(error)) {
        return error;
      }
  
      // Handle axios errors
      if (error.response?.data) {
        return error.response.data;
      }
  
      // Default error
      return {
        error: 'Unknown Error',
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }