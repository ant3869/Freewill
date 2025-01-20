// client/src/components/MemoryVisualization.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useAsyncAction } from '../hooks/useAsyncAction';
import ApiService from '../services/api';

type VisualizationType = 'activity' | 'types' | 'connections';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const MemoryVisualization: React.FC = () => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('activity');
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch memory stats
  const {
    execute: fetchStats,
    isLoading,
    error,
    data: stats
  } = useAsyncAction(async () => {
    const response = await ApiService.getMemoryStats(timeRange);
    return response;
  });

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const renderActivityChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={stats?.activity || []}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.375rem',
              color: '#E5E7EB'
            }}
          />
          <Line
            type="monotone"
            dataKey="memories"
            stroke="#3B82F6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTypeDistribution = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stats?.types || []}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {stats?.types?.map((entry: any, index: number) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.375rem',
              color: '#E5E7EB'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-4">
        {stats?.types?.map((entry: any, index: number) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-300">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConnectionsChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stats?.connections || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="type" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.375rem',
              color: '#E5E7EB'
            }}
          />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="h-full bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setVisualizationType('activity')}
            className={`p-2 rounded ${
              visualizationType === 'activity' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <LineChartIcon size={20} />
          </button>
          <button
            onClick={() => setVisualizationType('types')}
            className={`p-2 rounded ${
              visualizationType === 'types' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <PieChartIcon size={20} />
          </button>
          <button
            onClick={() => setVisualizationType('connections')}
            className={`p-2 rounded ${
              visualizationType === 'connections' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <BarChartIcon size={20} />
          </button>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-700 rounded px-2 py-1 text-sm"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message="Failed to load memory statistics" />
      ) : (
        <>
          {visualizationType === 'activity' && renderActivityChart()}
          {visualizationType === 'types' && renderTypeDistribution()}
          {visualizationType === 'connections' && renderConnectionsChart()}

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-400">Total Memories</div>
              <div className="text-xl font-bold text-gray-100">
                {stats?.totalMemories || 0}
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-400">Active Connections</div>
              <div className="text-xl font-bold text-gray-100">
                {stats?.activeConnections || 0}
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-400">Memory Usage</div>
              <div className="text-xl font-bold text-gray-100">
                {stats?.memoryUsage ? `${stats.memoryUsage.toFixed(1)}MB` : '0MB'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemoryVisualization;