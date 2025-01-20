// client/src/components/ErrorMessage.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
    <div className="flex items-center">
      <AlertCircle className="mr-2" size={20} />
      <span className="block sm:inline">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Retry
      </button>
    )}
  </div>
);
