// client/src/components/MemorySearchPanel.tsx
import React, { useState, useCallback } from 'react';
import { Search, Filter, Clock, ThumbsUp } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import ApiService from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface SearchResult {
  memory_id: number;
  content: string;
  metadata: Record<string, any>;
  relevance: number;
}

interface MemorySearchPanelProps {
  onMemorySelect?: (content: string) => void;
}

const MemorySearchPanel: React.FC<MemorySearchPanelProps> = ({ onMemorySelect }) => {
  // State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Search handler
  const {
    execute: performSearch,
    isLoading,
    error,
  } = useAsyncAction(async (searchQuery: string) => {
    const response = await ApiService.searchMemories(searchQuery, filters);
    setResults(response.results);
    return response;
  });

  // Debounced search
  const debouncedSearch = useCallback(
    async (value: string) => {
      if (value.length >= 2) {
        await performSearch(value);
      } else {
        setResults([]);
      }
    },
    [performSearch]
  );

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="w-full bg-gray-700 rounded-md pl-10 pr-4 py-2 text-sm"
              placeholder="Search memories..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md ${
              showFilters ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-700 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
            
            {/* Date Range */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date Range</label>
              <select
                className="w-full bg-gray-600 rounded text-sm p-1"
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                <option value="">All time</option>
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>

            {/* Memory Type */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Memory Type</label>
              <select
                className="w-full bg-gray-600 rounded text-sm p-1"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All types</option>
                <option value="CONVERSATION">Conversations</option>
                <option value="FACT">Facts</option>
                <option value="CONTEXT">Context</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorMessage message="Failed to search memories" />
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.memory_id}
                className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600"
                onClick={() => onMemorySelect?.(result.content)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 line-clamp-2">{result.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{new Date(result.metadata.timestamp).toLocaleDateString()}</span>
                      <ThumbsUp size={12} className="ml-2" />
                      <span>{Math.round(result.relevance * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query.length > 0 ? (
          <div className="text-center py-8 text-gray-400">
            No results found
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MemorySearchPanel;