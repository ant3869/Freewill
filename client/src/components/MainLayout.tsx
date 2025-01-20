// client/src/components/MainLayout.tsx
import React, { useState } from 'react';
import { Search, Settings, MessageSquare, Network } from 'lucide-react';
import Chat from './Chat';
import ModelControlPanel from './ModelControlPanel';
import MemorySearchPanel from './MemorySearchPanel';
import MemoryVisualization from './MemoryVisualization';
import SystemControls from './SystemControls';

type ActivePanel = 'none' | 'search' | 'settings' | 'visualization';

const MainLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(current => current === panel ? 'none' : panel);
  };

  return (
    <div className="flex h-full">
    <SystemControls />

      {/* Side Navigation */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={() => togglePanel('search')}
          className={`p-3 rounded-lg mb-2 ${
            activePanel === 'search' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Search Memories"
        >
          <Search size={20} />
        </button>
        <button
          onClick={() => togglePanel('settings')}
          className={`p-3 rounded-lg mb-2 ${
            activePanel === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Model Settings"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={() => togglePanel('visualization')}
          className={`p-3 rounded-lg mb-2 ${
            activePanel === 'visualization' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Memory Visualization"
        >
          <Network size={20} />
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <Chat />
      </div>

      {/* Right Panel */}
      <div 
        className={`border-l border-gray-700 transition-all duration-300 ${
          activePanel === 'none' ? 'w-0' : 'w-96'
        }`}
      >
        {activePanel === 'search' && (
          <MemorySearchPanel 
            onMemorySelect={(content) => {
              // Handle selected memory
              console.log('Selected memory:', content);
            }}
          />
        )}
        {activePanel === 'settings' && (
          <ModelControlPanel />
        )}
        {activePanel === 'visualization' && (
          <MemoryVisualization />
        )}
      </div>
    </div>
  );
};

export default MainLayout;