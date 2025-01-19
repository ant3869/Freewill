import { useState } from 'react';
import { ChevronLeft, ChevronRight, Mic, PlayCircle, Square, Plus, MoreVertical, Edit2, Trash2, Save } from 'lucide-react';
import MessageCard from './components/MessageCard';
import MetricsBar from './components/MetricsBar';
import ModelControls from './components/ModelControls';
import FineTuningPanel from './components/FineTuningPanel';
import AutonomousInterface from './components/AutonomousInterface';
import ApiService from './services/api';
import logger from './services/logger';
import DebugPanel from './components/DebugPanel';

type Mode = 'chat' | 'finetune' | 'autonomous';

interface Memory {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

interface Message {
  content: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'internal';
}

function App() {
  const [mode, setMode] = useState<Mode>('chat');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [systemRunning, setSystemRunning] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Project Requirements',
      content: 'Key requirements for the AI system...',
      timestamp: new Date().toLocaleString()
    },
    {
      id: '2',
      title: 'Training Parameters',
      content: 'Optimal parameters for model training...',
      timestamp: new Date().toLocaleString()
    }
  ]);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'General Discussion',
      timestamp: new Date().toLocaleString(),
      messages: [
        { 
          type: 'user', 
          content: 'Hello!',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          type: 'assistant',
          content: 'Hi there! How can I help you today?',
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    },
    {
      id: '2',
      title: 'Technical Support',
      timestamp: new Date().toLocaleString(),
      messages: []
    }
  ]);

  const [modelSettings, setModelSettings] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 512,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: []
  });

  const handleMemoryAdd = async () => {
    try {
      const newMemory = {
        type: 'FACT',
        content: newMemoryContent,
        metadata: {
          title: newMemoryTitle,
          timestamp: new Date().toISOString()
        }
      };
      
      const response = await ApiService.storeMemory(newMemory);
      
      setMemories([...memories, {
        id: response.id,
        title: newMemoryTitle,
        content: newMemoryContent,
        timestamp: new Date().toLocaleString()
      }]);
      
      setNewMemoryTitle('');
      setNewMemoryContent('');
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  const handleSaveMemory = (id: string) => {
    setMemories(memories.map(memory => 
      memory.id === id 
        ? { ...memory, title: newMemoryTitle || memory.title, content: newMemoryContent || memory.content }
        : memory
    ));
    setEditingMemoryId(null);
    setNewMemoryTitle('');
    setNewMemoryContent('');
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter(memory => memory.id !== id));
  };

  const handleAddChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date().toLocaleString(),
      messages: []
    };
    setChats([...chats, newChat]);
    setEditingChatId(newChat.id);
  };

  const handleSaveChat = (id: string) => {
    setChats(chats.map(chat => 
      chat.id === id 
        ? { ...chat, title: newMemoryTitle || chat.title }
        : chat
    ));
    setEditingChatId(null);
    setNewMemoryTitle('');
  };

  const handleDeleteChat = (id: string) => {
    setChats(chats.filter(chat => chat.id !== id));
    if (selectedChat === id) {
      setSelectedChat(null);
    }
  };

  const handleMessageEdit = (chatId: string, messageIndex: number, newText: string) => {
    setChats(chats.map(chat => 
      chat.id === chatId 
        ? {
            ...chat,
            messages: chat.messages.map((msg, idx) => 
              idx === messageIndex 
                ? { ...msg, content: newText }
                : msg
            )
          }
        : chat
    ));
  };

  const handleMessageRetry = (index: number) => {
    console.log('Retrying message at index:', index);
  };

  const handleMessageRate = (index: number, rating: 'up' | 'down') => {
    console.log('Rating message at index:', index, 'with rating:', rating);
  };

  const handleMessageSpeak = (text: string) => {
    console.log('Speaking text:', text);
  };

  const handleStartTraining = () => {
    console.log('Starting training...');
  };

  const handleStopTraining = () => {
    console.log('Stopping training...');
  };

  const handleUploadDataset = (file: File) => {
    console.log('Uploading dataset:', file.name);
  };

  const currentChat = chats.find(chat => chat.id === selectedChat);

  // Add logging to key operations
  const handleSystemToggle = async () => {
    logger.info('Toggling system state', { currentState: systemRunning });
    try {
      if (systemRunning) {
        await ApiService.stopModel();
        logger.info('System stopped successfully');
      } else {
        await ApiService.startModel('DarkIdol-Llama-3_1');
        logger.info('System started successfully');
      }
      setSystemRunning(!systemRunning);
    } catch (error) {
      logger.error('Failed to toggle system', { error });
      console.error('Failed to toggle system:', error);
    }
  };
  
  const handleMessageSend = async (message: string) => {
    if (!selectedChat) {
      logger.warn('No chat selected for message send');
      return;
    }
    
    logger.debug('Sending message', { chatId: selectedChat, message });
    try {
      const response = await ApiService.sendMessage({
        content: message,
        temperature: modelSettings.temperature,
        max_tokens: modelSettings.maxTokens
      });

      logger.info('Message sent successfully', { response });

      setChats(chats.map(chat => 
        chat.id === selectedChat
          ? {
              ...chat,
              messages: [...chat.messages, 
                { 
                  type: 'user', 
                  content: message,
                  timestamp: new Date().toLocaleTimeString()
                },
                {
                  type: 'assistant',
                  content: response.response,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]
            }
          : chat
      ));
    } catch (error) {
      logger.error('Failed to send message', { error, message });
      console.error('Failed to send message:', error);
    }
  };

  const handleModelSettingsChange = async (settings: any) => {
    logger.info('Updating model settings', { settings });
    try {
      await ApiService.updateModelSettings(settings);
      setModelSettings(settings);
      logger.debug('Model settings updated successfully');
    } catch (error) {
      logger.error('Failed to update model settings', { error, settings });
      console.error('Failed to update model settings:', error);
    }
  };

  const handleAddMemory = async () => {
    logger.info('Adding new memory', { title: newMemoryTitle, content: newMemoryContent });
    try {
      const newMemory = {
        type: 'FACT',
        content: newMemoryContent,
        metadata: {
          title: newMemoryTitle,
          timestamp: new Date().toISOString()
        }
      };
      
      const response = await ApiService.storeMemory(newMemory);
      logger.debug('Memory stored successfully', { response });
      
      setMemories([...memories, {
        id: response.id,
        title: newMemoryTitle,
        content: newMemoryContent,
        timestamp: new Date().toLocaleString()
      }]);
      
      setNewMemoryTitle('');
      setNewMemoryContent('');
    } catch (error) {
      logger.error('Failed to add memory', { error, memory: { title: newMemoryTitle, content: newMemoryContent } });
      console.error('Failed to add memory:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Top Navigation */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl">DarkIdol LLM</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMode('chat')}
            className={`px-4 py-1 rounded ${
              mode === 'chat' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Chat Mode
          </button>
          <button 
            onClick={() => setMode('finetune')}
            className={`px-4 py-1 rounded ${
              mode === 'finetune' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Fine-tune Mode
          </button>
          <button 
            onClick={() => setMode('autonomous')}
            className={`px-4 py-1 rounded ${
              mode === 'autonomous' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Autonomous Mode
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select className="bg-gray-700 rounded px-2 py-1">
            <option>DarkIdol-Llama-3_1</option>
          </select>
          
          <button 
            onClick={() => setSystemRunning(!systemRunning)}
            className={`flex items-center gap-2 px-3 py-1 rounded ${
              systemRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {systemRunning ? <Square size={16} /> : <PlayCircle size={16} />}
            {systemRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {mode !== 'autonomous' && (
          <>
            {/* Left Panel */}
            <div className={`flex flex-col border-r border-gray-700 transition-all duration-300 ${
              leftPanelCollapsed ? 'w-0' : 'w-80'
            }`}>
              {!leftPanelCollapsed && (
                 <>
                 <div className="h-1/2 border-b border-gray-700">
                   <div className="p-2 bg-gray-800 text-white flex justify-between items-center">
                     <span>Memory Bank</span>
                     <button 
                       onClick={handleAddMemory}
                       className="p-1 hover:bg-gray-700 rounded"
                     >
                       <Plus size={16} />
                     </button>
                   </div>
                   <div className="overflow-y-auto p-2 space-y-2">
                     {memories.map(memory => (
                       <div key={memory.id} className="bg-gray-800 rounded-lg overflow-hidden">
                         {editingMemoryId === memory.id ? (
                           <div className="p-3 space-y-2">
                             <input
                               type="text"
                               value={newMemoryTitle || memory.title}
                               onChange={(e) => setNewMemoryTitle(e.target.value)}
                               className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                               placeholder="Memory Title"
                             />
                             <textarea
                               value={newMemoryContent || memory.content}
                               onChange={(e) => setNewMemoryContent(e.target.value)}
                               className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                               rows={3}
                               placeholder="Memory Content"
                             />
                             <div className="flex justify-end gap-2">
                               <button
                                 onClick={() => handleSaveMemory(memory.id)}
                                 className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
                               >
                                 <Save size={12} />
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div className="p-3">
                             <div className="flex justify-between items-start mb-1">
                               <h3 className="font-medium">{memory.title}</h3>
                               <div className="flex gap-1">
                                 <button
                                   onClick={() => {
                                     setEditingMemoryId(memory.id);
                                     setNewMemoryTitle(memory.title);
                                     setNewMemoryContent(memory.content);
                                   }}
                                   className="p-1 hover:bg-gray-700 rounded"
                                 >
                                   <Edit2 size={12} />
                                 </button>
                                 <button
                                   onClick={() => handleDeleteMemory(memory.id)}
                                   className="p-1 hover:bg-gray-700 rounded text-red-500"
                                 >
                                   <Trash2 size={12} />
                                 </button>
                               </div>
                             </div>
                             <p className="text-sm text-gray-400 line-clamp-2">{memory.content}</p>
                             <div className="text-xs text-gray-500 mt-1">{memory.timestamp}</div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="h-1/2">
                   <div className="p-2 bg-gray-800 text-white flex justify-between items-center">
                     <span>Chats</span>
                     <div className="flex gap-1">
                       <button
                         onClick={handleAddChat}
                         className="p-1 hover:bg-gray-700 rounded"
                       >
                         <Plus size={16} />
                       </button>
                       <button className="p-1 hover:bg-gray-700 rounded">
                         <MoreVertical size={16} />
                       </button>
                     </div>
                   </div>
                   <div className="overflow-y-auto p-2 space-y-2">
                     {chats.map(chat => (
                       <div 
                         key={chat.id}
                         className={`rounded-lg overflow-hidden cursor-pointer ${
                           selectedChat === chat.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
                         }`}
                         onClick={() => setSelectedChat(chat.id)}
                       >
                         {editingChatId === chat.id ? (
                           <div className="p-3 space-y-2">
                             <input
                               type="text"
                               value={newMemoryTitle || chat.title}
                               onChange={(e) => setNewMemoryTitle(e.target.value)}
                               className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                               placeholder="Chat Title"
                             />
                             <div className="flex justify-end gap-2">
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleSaveChat(chat.id);
                                 }}
                                 className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
                               >
                                 <Save size={12} />
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div className="p-3">
                             <div className="flex justify-between items-center">
                               <h3 className="font-medium">{chat.title}</h3>
                               <div className="flex gap-1">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setEditingChatId(chat.id);
                                     setNewMemoryTitle(chat.title);
                                   }}
                                   className="p-1 hover:bg-gray-600 rounded"
                                 >
                                   <Edit2 size={12} />
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeleteChat(chat.id);
                                   }}
                                   className="p-1 hover:bg-gray-600 rounded text-red-500"
                                 >
                                   <Trash2 size={12} />
                                 </button>
                               </div>
                             </div>
                             <div className="text-xs text-gray-400 mt-1">
                               {chat.messages.length} messages
                             </div>
                             <div className="text-xs text-gray-500 mt-1">{chat.timestamp}</div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               </>
              )}
              <button 
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="absolute left-80 top-1/2 -translate-y-1/2 bg-gray-800 p-1 rounded-r"
              >
                {leftPanelCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </>
        )}

        {/* Center Panel */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {mode === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                  {currentChat?.messages.map((msg, index) => (
                    <MessageCard
                      key={index}
                      message={msg}
                      type={msg.type}
                      onEdit={(text) => handleMessageEdit(currentChat.id, index, text)}
                      onRetry={() => handleMessageRetry(index)}
                      onRate={(rating) => handleMessageRate(index, rating)}
                      onSpeak={() => handleMessageSpeak(msg.content)}
                    />
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-700 rounded hover:bg-gray-600">
                      <Mic size={20} />
                    </button>
                    <input 
                      type="text" 
                      className="flex-1 bg-gray-700 rounded px-4 py-2" 
                      placeholder="Type your message..."
                    />
                    <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : mode === 'finetune' ? (
            <FineTuningPanel
              onStartTraining={handleStartTraining}
              onStopTraining={handleStopTraining}
              onUploadDataset={handleUploadDataset}
            />
          ) : (
            <AutonomousInterface />
          )}
        </div>

        {mode !== 'autonomous' && (
          <>
            {/* Right Panel */}
            <div className={`flex flex-col border-l border-gray-700 transition-all duration-300 ${
              rightPanelCollapsed ? 'w-0' : 'w-80'
            }`}>
              {!rightPanelCollapsed && (
                <div className="p-4 overflow-y-auto">
                  <ModelControls
                    settings={modelSettings}
                    onSettingsChange={setModelSettings}
                  />
                </div>
              )}
              <button 
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className="absolute right-80 top-1/2 -translate-y-1/2 bg-gray-800 p-1 rounded-l"
              >
                {rightPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom Metrics Bar */}
      {mode !== 'autonomous' && <MetricsBar />}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </div>
  );
}

export default App;