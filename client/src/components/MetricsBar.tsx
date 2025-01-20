import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, MonitorSpeaker, Clock, Activity, Zap } from 'lucide-react';
import ApiService from '../services/api';

// interface Metrics {
//   cpu_usage: number;
//   ram_usage: number;
//   gpu_usage: number | null;
//   tokens: {
//     current: number;
//     total: number;
//     limit: number;
//   };
//   response_time: number;
//   alignment_score: number;
// }

interface SystemMetrics {
  cpu_usage: number;
  ram_usage: number;
  gpu_usage: number | null;
  tokens: {
    current: number;
    total: number;
    limit: number;
  };
  response_time: number;
  alignment_score: number;
}

const MetricsBar: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    ram_usage: 0,
    gpu_usage: null,
    tokens: {
      current: 0,
      total: 0,
      limit: 2048,
    },
    response_time: 0,
    alignment_score: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await ApiService.getSystemMetrics();
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Set up polling
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const getUsageColor = (usage: number): string => {
    if (usage > 80) return 'bg-red-500';
    if (usage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-sm">
      {/* Resource Usage Section */}
      <div className="flex items-center space-x-6">
        {/* CPU Usage */}
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-gray-700 rounded">
              <div
                className={`h-full ${getUsageColor(
                  metrics.cpu_usage
                )} rounded transition-all duration-300`}
                style={{ width: `${metrics.cpu_usage}%` }}
              />
            </div>
            <span className="text-gray-300">{metrics.cpu_usage.toFixed(1)}%</span>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-gray-700 rounded">
              <div
                className={`h-full ${getUsageColor(
                  metrics.ram_usage
                )} rounded transition-all duration-300`}
                style={{ width: `${metrics.ram_usage}%` }}
              />
            </div>
            <span className="text-gray-300">{metrics.ram_usage.toFixed(1)}%</span>
          </div>
        </div>

        {/* GPU Usage (if available) */}
        {metrics.gpu_usage !== null && (
          <div className="flex items-center space-x-2">
            <MonitorSpeaker className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-700 rounded">
                <div
                  className={`h-full ${getUsageColor(
                    metrics.gpu_usage
                  )} rounded transition-all duration-300`}
                  style={{ width: `${metrics.gpu_usage}%` }}
                />
              </div>
              <span className="text-gray-300">
                {metrics.gpu_usage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Model Metrics Section */}
      <div className="flex items-center space-x-6">
        {/* Token Usage */}
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-blue-400">
            {metrics.tokens.current}/{metrics.tokens.limit}
            <span className="text-gray-500 ml-1">
              (Total: {metrics.tokens.total.toLocaleString()})
            </span>
          </span>
        </div>

        {/* Response Time */}
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-green-400">{metrics.response_time.toFixed(2)}s</span>
        </div>

        {/* Alignment Score */}
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-gray-400" />
          <span
            className={`${
              metrics.alignment_score > 80 ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            {metrics.alignment_score}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricsBar;

// const MetricsBar: React.FC = () => {
//   const [metrics, setMetrics] = useState<Metrics>({
//     cpu_usage: 0,
//     ram_usage: 0,
//     gpu_usage: null,
//     tokens: {
//       current: 0,
//       total: 0,
//       limit: 2048
//     },
//     response_time: 0,
//     alignment_score: 0
//   });

//   const getUsageColor = (usage: number): string => {
//     if (usage > 80) return 'bg-red-500';
//     if (usage > 60) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   // Simulated metrics update for demo
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMetrics(prev => ({
//         ...prev,
//         cpu_usage: Math.random() * 100,
//         ram_usage: Math.random() * 100,
//         gpu_usage: Math.random() * 100,
//         tokens: {
//           ...prev.tokens,
//           current: Math.floor(Math.random() * prev.tokens.limit)
//         },
//         response_time: Math.random() * 2,
//         alignment_score: Math.floor(Math.random() * 100)
//       }));
//     }, 2000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-gray-900 p-2 flex items-center gap-4 text-sm border-t border-gray-700">
//       <div className="flex items-center gap-2">
//         <span>CPU:</span>
//         <div className="w-24 h-2 bg-gray-700 rounded">
//           <div 
//             className={`h-full ${getUsageColor(metrics.cpu_usage)} rounded transition-all duration-300`} 
//             style={{width: `${metrics.cpu_usage}%`}}
//           />
//         </div>
//         <span>{metrics.cpu_usage.toFixed(1)}%</span>
//       </div>

//       <div className="flex items-center gap-2">
//         <span>RAM:</span>
//         <div className="w-24 h-2 bg-gray-700 rounded">
//           <div 
//             className={`h-full ${getUsageColor(metrics.ram_usage)} rounded transition-all duration-300`} 
//             style={{width: `${metrics.ram_usage}%`}}
//           />
//         </div>
//         <span>{metrics.ram_usage.toFixed(1)}%</span>
//       </div>

//       {metrics.gpu_usage !== null && (
//         <div className="flex items-center gap-2">
//           <span>GPU:</span>
//           <div className="w-24 h-2 bg-gray-700 rounded">
//             <div 
//               className={`h-full ${getUsageColor(metrics.gpu_usage)} rounded transition-all duration-300`} 
//               style={{width: `${metrics.gpu_usage}%`}}
//             />
//           </div>
//           <span>{metrics.gpu_usage.toFixed(1)}%</span>
//         </div>
//       )}

//       <div className="ml-auto flex items-center gap-4">
//         <div className="flex items-center gap-2">
//           <span>Tokens:</span>
//           <span className="text-blue-400">
//             {metrics.tokens.current}/{metrics.tokens.limit}
//             <span className="text-gray-500 ml-1">
//               (Total: {metrics.tokens.total.toLocaleString()})
//             </span>
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <span>Response:</span>
//           <span className="text-green-400">
//             {metrics.response_time.toFixed(2)}s
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <span>Alignment:</span>
//           <span className={`${metrics.alignment_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
//             {metrics.alignment_score}%
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MetricsBar;