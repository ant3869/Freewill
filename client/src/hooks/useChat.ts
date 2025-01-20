// client/src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';
import ApiService from '../services/api';
import { Message } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useLoading();

  const sendMessage = useCallback(async (content: string) => {
    try {
      dispatch({ type: 'START_LOADING', payload: 'chat' });
      setError(null);

      // Add user message
      const userMessage: Message = {
        content,
        timestamp: new Date().toLocaleTimeString(),
        type: 'user'
      };
      setMessages(prev => [...prev, userMessage]);

      // Get response from API
    //   const response = await ApiService.sendMessage({ message: content });
      const response = await ApiService.sendMessage({ content });

      // Add assistant message
      const assistantMessage: Message = {
        content: response.response.response,
        timestamp: new Date().toLocaleTimeString(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      dispatch({ type: 'STOP_LOADING', payload: 'chat' });
    }
  }, [dispatch]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    error,
    sendMessage,
    clearMessages,
  };
}