// client/src/components/Chat.tsx
import React, { useState } from 'react';
import { Send, Loader, RefreshCw } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useLoading } from '../context/LoadingContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import MessageCard from './MessageCard';

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, error, sendMessage, clearMessages } = useChat();
  const { state: loadingState } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingState.chat) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageCard
            key={index}
            message={message}
            type={message.type}
            onRetry={message.type === 'assistant' && index > 0 ? () => sendMessage(messages[index - 1]?.content || '') :  () => {} }
            onEdit={(text: string) => {
                console.log(`Edit triggered with text: ${text}`);
                // Add your logic for editing a message here
              }}
              onRate={(rating: 'up' | 'down') => {
                console.log(`Rate triggered with rating: ${rating}`);
                // Add your logic for rating here
              }}
              onSpeak={() => {
                console.log('Speak triggered');
                // Add your logic for speaking a message here
              }}
          />
        ))}
        
        {loadingState.chat && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <ErrorMessage 
            message={error}
            onRetry={() => messages.length > 0 && sendMessage(messages[messages.length - 1].content)}
          />
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loadingState.chat}
              className="flex-1 bg-gray-700 rounded px-4 py-2 text-white disabled:opacity-50"
              placeholder="Type your message..."
            />
            
            <button
              type="submit"
              disabled={!input.trim() || loadingState.chat}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingState.chat ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={clearMessages}
              className="p-2 text-gray-400 hover:text-gray-300"
              title="Clear chat"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Chat;