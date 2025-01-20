// client/src/components/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Cpu, Clock, BrainCog } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useAsyncAction } from '../hooks/useAsyncAction';
import ApiService from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [activeTab, setActiveTab] = useState('performance');

  const {
    execute: fetchMetrics,
    isLoading,
    error,
    data: metrics
  } = useAsyncAction(async () => {
    const [requestMetrics, performanceMetrics] = await Promise.all([
      ApiService.getRequestMetrics(timeRange),
      ApiService.getPerformanceMetrics(timeRange)
    ]);
    return { requestMetrics, performanceMetrics };
  });

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      {/* CPU & Memory Timeline */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics?.performanceMetrics.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()} 
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#E5E7EB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="cpu_usage" 
                stroke="#3B82F6" 
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory_usage" 
                stroke="#10B981" 
                name="Memory Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Cpu size={16} />
            <span>Avg CPU</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics?.performanceMetrics.summary.avg_cpu_usage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <BrainCog size={16} />
            <span>Avg Memory</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics?.performanceMetrics.summary.avg_memory_usage.toFixed(1)}MB
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity size={16} />
            <span>Queue Size</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics?.performanceMetrics.summary.avg_queue_size.toFixed(1)}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock size={16} />
            <span>Response Time</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics?.requestMetrics.avg_generation_time.toFixed(2)}s
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequestMetrics = () => (
    <div className="space-y-6">
      {/* Request Success Rate */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Request Success Rate</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  {
                    name: 'Successful',
                    value: metrics?.requestMetrics.successful_requests
                  },
                  {
                    name: 'Failed',
                    value: metrics?.requestMetrics.total_requests - 
                           metrics?.requestMetrics.successful_requests
                  }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {metrics?.requestMetrics.total_requests > 0 && COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
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
        </div>
      </div>

      {/* Error Distribution */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Error Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(metrics?.requestMetrics.error_distribution || {})
              .map(([type, count]) => ({ type, count }))}>
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
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded ${
              activeTab === 'performance' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded ${
              activeTab === 'requests' ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            Requests
          </button>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message="Failed to load analytics data" />
      ) : (
        activeTab === 'performance' ? renderPerformanceMetrics() : renderRequestMetrics()
      )}
    </div>
  );
};

export default AnalyticsDashboard;

// import { useState } from 'react';
// import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// const AnalyticsDashboard = () => {
//   const [activeTab, setActiveTab] = useState('metrics');
  
//   const detailedMetrics = {
//     quality: {
//       basic: [
//         { name: 'Coherence', value: 0.85, color: 'bg-blue-500' },
//         { name: 'Factual Accuracy', value: 0.92, color: 'bg-green-500' },
//         { name: 'Context Relevance', value: 0.78, color: 'bg-blue-500' },
//         { name: 'Creativity', value: 0.65, color: 'bg-yellow-500' },
//         { name: 'Consistency', value: 0.88, color: 'bg-blue-500' }
//       ],
//       advanced: [
//         { name: 'Grammar Score', value: 0.95, color: 'bg-purple-500' },
//         { name: 'Semantic Similarity', value: 0.82, color: 'bg-indigo-500' },
//         { name: 'Source Citation', value: 0.76, color: 'bg-pink-500' },
//         { name: 'Logical Flow', value: 0.89, color: 'bg-cyan-500' },
//         { name: 'Topic Adherence', value: 0.91, color: 'bg-emerald-500' }
//       ]
//     },
//     performance: {
//       latency: [
//         { name: 'Token Generation', value: 45, unit: 'ms' },
//         { name: 'Context Processing', value: 78, unit: 'ms' },
//         { name: 'Memory Lookup', value: 23, unit: 'ms' },
//         { name: 'Total Response', value: 146, unit: 'ms' }
//       ],
//       resources: [
//         { name: 'GPU Utilization', value: 67, unit: '%' },
//         { name: 'VRAM Usage', value: 5.2, unit: 'GB' },
//         { name: 'CPU Usage', value: 32, unit: '%' },
//         { name: 'Memory Usage', value: 8.4, unit: 'GB' }
//       ]
//     },
//     finetuning: {
//       current: [
//         { name: 'Current Epoch', value: '24/50', subtext: '48% Complete' },
//         { name: 'Training Loss', value: '0.0234', subtext: '-0.0012 from last' },
//         { name: 'Validation Loss', value: '0.0256', subtext: '-0.0008 from last' },
//         { name: 'Learning Rate', value: '1e-5', subtext: 'Adaptive' },
//         { name: 'Gradient Norm', value: '0.0045', subtext: 'Stable' },
//         { name: 'Weight Updates', value: '12.4M', subtext: 'Total' },
//         { name: 'Time Remaining', value: '2.5h', subtext: 'Estimated' },
//         { name: 'Batch Size', value: '32', subtext: 'Dynamic' }
//       ],
//       improvements: [
//         { metric: 'Accuracy', baseline: 82, current: 91, target: 95 },
//         { metric: 'Response Time', baseline: 245, current: 198, target: 180 },
//         { metric: 'Token Efficiency', baseline: 76, current: 89, target: 92 },
//         { metric: 'Memory Usage', baseline: 100, current: 85, target: 80 }
//       ]
//     },
//     memory: {
//       stats: [
//         { name: 'Active Memories', value: 24, trend: '+3' },
//         { name: 'Connections', value: 86, trend: '+12' },
//         { name: 'Recent Access', value: 12, trend: '-2' },
//         { name: 'Avg Strength', value: 76, trend: '+5' }
//       ],
//       types: [
//         { type: 'Context', count: 12, strength: 0.85 },
//         { type: 'Fact', count: 28, strength: 0.92 },
//         { type: 'Conversation', count: 15, strength: 0.78 }
//       ]
//     }
//   };

//   const renderMetricCard = (metric: { name: any; value: any; color?: any; trend?: any; subtext?: any; }, showTrend = false) => (
//     <div key={metric.name} className="bg-gray-900 p-4 rounded-lg">
//       <div className="flex justify-between mb-2">
//         <span className="text-gray-100">{metric.name}</span>
//         <div className="flex items-center gap-2">
//           <span className="text-gray-100">
//             {typeof metric.value === 'number' ? 
//               `${(metric.value * 100).toFixed(0)}%` : 
//               metric.value}
//           </span>
//           {showTrend && metric.trend && (
//             <span className={`text-sm ${
//               metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
//             }`}>
//               {metric.trend}
//             </span>
//           )}
//         </div>
//       </div>
//       {metric.color && (
//         <div className="h-2 bg-gray-800 rounded overflow-hidden">
//           <div
//             className={`h-full ${metric.color} transition-all duration-300`}
//             style={{ width: `${typeof metric.value === 'number' ? metric.value * 100 : 0}%` }}
//           />
//         </div>
//       )}
//       {metric.subtext && (
//         <div className="text-sm text-gray-400 mt-1">{metric.subtext}</div>
//       )}
//     </div>
//   );

//   return (
//     <div className="w-full p-6 bg-gray-900">
//       <div className="flex gap-4 mb-6">
//         <button
//           onClick={() => setActiveTab('metrics')}
//           className={`px-4 py-2 rounded text-gray-100 ${
//             activeTab === 'metrics' ? 'bg-blue-600' : 'bg-gray-800'
//           }`}
//         >
//           Quality Metrics
//         </button>
//         <button
//           onClick={() => setActiveTab('fineTuning')}
//           className={`px-4 py-2 rounded text-gray-100 ${
//             activeTab === 'fineTuning' ? 'bg-blue-600' : 'bg-gray-800'
//           }`}
//         >
//           Fine-tuning Analysis
//         </button>
//       </div>

//       {activeTab === 'metrics' ? (
//         <>
//           {/* Basic Quality Metrics */}
//           <div className="bg-gray-800 p-6 rounded-lg mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Basic Quality Metrics</h2>
//             <div className="grid grid-cols-2 gap-4">
//               {detailedMetrics.quality.basic.map(metric => renderMetricCard(metric))}
//             </div>
//           </div>

//           {/* Advanced Quality Metrics */}
//           <div className="bg-gray-800 p-6 rounded-lg mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Advanced Quality Metrics</h2>
//             <div className="grid grid-cols-2 gap-4">
//               {detailedMetrics.quality.advanced.map(metric => renderMetricCard(metric))}
//             </div>
//           </div>

//           {/* Performance Metrics */}
//           <div className="bg-gray-800 p-6 rounded-lg mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Performance Metrics</h2>
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-100">Latency Breakdown</h3>
//                 <div className="space-y-3">
//                   {detailedMetrics.performance.latency.map(metric => (
//                     <div key={metric.name} className="bg-gray-900 p-3 rounded-lg">
//                       <div className="flex justify-between text-gray-100">
//                         <span>{metric.name}</span>
//                         <span>{metric.value}{metric.unit}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold mb-3 text-gray-100">Resource Utilization</h3>
//                 <div className="space-y-3">
//                   {detailedMetrics.performance.resources.map(metric => (
//                     <div key={metric.name} className="bg-gray-900 p-3 rounded-lg">
//                       <div className="flex justify-between text-gray-100">
//                         <span>{metric.name}</span>
//                         <span>{metric.value}{metric.unit}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Memory Analytics */}
//           <div className="bg-gray-800 p-6 rounded-lg">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Memory Analytics</h2>
//             <div className="grid grid-cols-4 gap-4 mb-6">
//               {detailedMetrics.memory.stats.map(metric => renderMetricCard(metric, true))}
//             </div>
//             <h3 className="text-lg font-semibold mb-3 text-gray-100">Memory Type Distribution</h3>
//             <div className="grid grid-cols-3 gap-4">
//               {detailedMetrics.memory.types.map(type => (
//                 <div key={type.type} className="bg-gray-900 p-4 rounded-lg">
//                   <div className="text-gray-100 font-semibold">{type.type}</div>
//                   <div className="text-2xl text-blue-400 mb-1">{type.count}</div>
//                   <div className="text-sm text-gray-400">
//                     Strength: {(type.strength * 100).toFixed(0)}%
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       ) : (
//         <>
//           {/* Fine-tuning Metrics */}
//           <div className="bg-gray-800 p-6 rounded-lg mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Training Metrics</h2>
//             <div className="grid grid-cols-4 gap-4">
//               {detailedMetrics.finetuning.current.map(metric => renderMetricCard(metric))}
//             </div>
//           </div>

//           {/* Improvement Tracking */}
//           <div className="bg-gray-800 p-6 rounded-lg mb-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-100">Improvement Tracking</h2>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={detailedMetrics.finetuning.improvements}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                   <XAxis dataKey="metric" stroke="#D1D5DB" />
//                   <YAxis stroke="#D1D5DB" />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: '#1F2937',
//                       border: 'none',
//                       borderRadius: '0.5rem',
//                       color: '#F9FAFB'
//                     }}
//                   />
//                   <Legend />
//                   <Bar dataKey="baseline" name="Baseline" fill="#3B82F6" />
//                   <Bar dataKey="current" name="Current" fill="#10B981" />
//                   <Bar dataKey="target" name="Target" fill="#F59E0B" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AnalyticsDashboard;