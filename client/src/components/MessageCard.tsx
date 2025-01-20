import React, { useState } from 'react';
import { Edit2, RefreshCw, ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';

interface Message {
  content: string;
  timestamp: string;
}

interface MessageCardProps {
  message: Message;
  type: 'user' | 'assistant' | 'internal';
  onEdit: (text: string) => void;
  onRetry: () => void;
  onRate: (rating: 'up' | 'down') => void;
  onSpeak: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ 
  message, 
  type, 
  onEdit, 
  onRetry = () => {}, 
  onRate, 
  onSpeak 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);

  const handleSave = () => {
    onEdit(editedText);
    setIsEditing(false);
  };

  const getMessageIcon = () => {
    switch (type) {
      case 'user':
        return '👤';
      case 'internal':
        return '💭';
      default:
        return '🤖';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg mb-4 ${
      type === 'user' ? 'ml-12' : type === 'internal' ? 'opacity-75' : ''
    }`}>
      <div className="flex justify-between items-start p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getMessageIcon()}</span>
          <span className="text-sm text-gray-400">{message.timestamp}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onSpeak}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Speak message"
          >
            <Volume2 size={16} />
          </button>
          {type !== 'user' && (
            <>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                title="Edit response"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={onRetry}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                title="Regenerate response"
              >
                <RefreshCw size={16} />
              </button>
              <div className="flex gap-1">
                <button 
                  onClick={() => onRate('up')}
                  className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  title="Rate good"
                >
                  <ThumbsUp size={16} />
                </button>
                <button 
                  onClick={() => onRate('down')}
                  className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  title="Rate bad"
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="p-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input 
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
            />
            <button 
              onClick={handleSave}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
};

export default MessageCard;