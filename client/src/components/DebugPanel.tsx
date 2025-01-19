// client/src/components/DebugPanel.tsx
import React, { useState, useEffect } from 'react';
import { logger } from '../services/logger';
import { Bug, Download, RefreshCw, X } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState(logger.getLogs());
  const [filter, setFilter] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLogs(logger.getLogs());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    JSON.stringify(log.data).toLowerCase().includes(filter.toLowerCase())
  );

  const getLogColor = (level: string) => {
    const colors = {
      debug: 'text-gray-400',
      info: 'text-blue-400',
      warn: 'text-yellow-400',
      error: 'text-red-400'
    };
    return colors[level as keyof typeof colors] || 'text-gray-400';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-full h-96 bg-gray-900 rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug size={16} />
          <span className="font-semibold">Debug Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => logger.downloadLogs()}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-2 border-b border-gray-700">
        <input
          type="text"
          placeholder="Filter logs..."
          className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
        {filteredLogs.map((log, index) => (
          <div
            key={index}
            className={`p-1 rounded hover:bg-gray-800 ${getLogColor(log.level)}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="uppercase font-semibold">{log.level}</span>
            </div>
            <div>{log.message}</div>
            {log.data && (
              <pre className="mt-1 text-gray-400 whitespace-pre-wrap">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}
          >
            <RefreshCw size={16} />
          </button>
          <span className="text-xs text-gray-400">
            {logs.length} logs
          </span>
        </div>
        <button
          onClick={() => {
            logger.clearLogs();
            setLogs([]);
          }}
          className="text-xs text-gray-400 hover:text-gray-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;