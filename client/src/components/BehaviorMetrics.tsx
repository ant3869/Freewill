import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricPoint {
  time: string;
  acc: number;
  curr: number;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface SelectOption {
  title: string;
  value: string;
}

interface BehaviorMetricsState {
  metrics: MetricPoint[];
  timeRange: TimeRange;
  selectedTimeRange: string;
  currentValues: {
    acc: number;
    curr: number;
  };
}

const TIME_RANGE_OPTIONS: SelectOption[] = [
  { title: 'Last 5 minutes', value: '5m' },
  { title: 'Last 15 minutes', value: '15m' },
  { title: 'Last 30 minutes', value: '30m' },
  { title: 'Last 1 hour', value: '1h' }
];

const BehaviorMetrics: React.FC = () => {
  const [state, setState] = useState<BehaviorMetricsState>({
    metrics: [],
    timeRange: {
      start: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      end: new Date()
    },
    selectedTimeRange: '5m',
    currentValues: {
      acc: 0,
      curr: 0
    }
  });

  const updateTimeRange = useCallback((value: string) => {
    const now = new Date();
    let start: Date;

    switch (value) {
      case '15m':
        start = new Date(now.getTime() - 15 * 60000);
        break;
      case '30m':
        start = new Date(now.getTime() - 30 * 60000);
        break;
      case '1h':
        start = new Date(now.getTime() - 60 * 60000);
        break;
      default:
        start = new Date(now.getTime() - 5 * 60000);
    }

    setState(prev => ({
      ...prev,
      timeRange: { start, end: now },
      selectedTimeRange: value
    }));
  }, []);

  const addMetricPoint = useCallback((acc: number, curr: number) => {
    const newPoint: MetricPoint = {
      time: new Date().toISOString(),
      acc,
      curr
    };

    setState(prev => ({
      ...prev,
      metrics: [...prev.metrics, newPoint].slice(-100),
      currentValues: { acc, curr }
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const acc = Math.random();
      const curr = Math.random();
      addMetricPoint(acc, curr);
    }, 1000);

    return () => clearInterval(interval);
  }, [addMetricPoint]);

  const getFilteredMetrics = useCallback(() => {
    return state.metrics.filter(metric => {
      const time = new Date(metric.time);
      return time >= state.timeRange.start && time <= state.timeRange.end;
    });
  }, [state.metrics, state.timeRange]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Behavior Metrics</h3>
        <select
          value={state.selectedTimeRange}
          onChange={(e) => updateTimeRange(e.target.value)}
          className="bg-gray-700 rounded px-2 py-1 text-sm"
        >
          {TIME_RANGE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getFilteredMetrics()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tickFormatter={(time: string) => new Date(time).toLocaleTimeString()}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#E5E7EB'
              }}
              labelFormatter={(label: string) => new Date(label).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey="acc"
              stroke="#3B82F6"
              name="Accumulated"
            />
            <Line
              type="monotone"
              dataKey="curr"
              stroke="#10B981"
              name="Current"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-400">Accumulated Rate</div>
          <div className="text-xl text-gray-100">
            {state.currentValues.acc.toFixed(3)}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-400">Current Rate</div>
          <div className="text-xl text-gray-100">
            {state.currentValues.curr.toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorMetrics;

// // src/components/BehaviorMetrics.tsx
// import { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, Radar, PolarAngleAxis, BarChart, Legend, Bar, AreaChart, Area } from 'recharts';

// interface ConversationalFlow {
//   time: string;
//   initiative: number;
//   responsiveness: number;
//   engagement: number;
// }

// interface TopicControl {
//   subject: string;
//   value: number;
//   confidence: number;
// }

// interface Prediction {
//   type: string;
//   probability: number;
//   timestamp: string;
// }

// interface BehaviorData {
//   conversationalFlow: ConversationalFlow[];
//   topicControl: TopicControl[];
//   predictions: Prediction[];
//   optimization: {
//     learningRate: number;
//     adaptationSpeed: number;
//   };
//   emotionalTrends: {
//     empathy: number;
//     adapted: number;
//     value: number;
//   };
// }

// const BehaviorMetrics: React.FC = () => {
//     const [behaviorData, setBehaviorData] = useState<BehaviorData>({
//       conversationalFlow: [],
//       topicControl: [],
//       predictions: [],
//       optimization: {
//         learningRate: 0,
//         adaptationSpeed: 0
//       },
//       emotionalTrends: {
//         empathy: 0,
//         adapted: 0,
//         value: 0
//       }
//     });
  
//   // Simulate real-time data updates
//   useEffect(() => {
//     const updateMetrics = () => {
//       setMetrics(prev => ({
//         conversationalFlow: [...prev.conversationalFlow.slice(-10), {
//           time: new Date().toLocaleTimeString(),
//           initiative: 0.5 + Math.random() * 0.5,
//           responsiveness: 0.5 + Math.random() * 0.5,
//           engagement: 0.5 + Math.random() * 0.5
//         }],
//         topicControl: generateTopicControl(),
//         predictions: generatePredictions(),
//         optimization: generateOptimization(),
//         emotionalTrends: [...prev.emotionalTrends.slice(-10), {
//           time: new Date().toLocaleTimeString(),
//           empathy: 0.5 + Math.random() * 0.5,
//           tone: 0.5 + Math.random() * 0.5,
//           support: 0.5 + Math.random() * 0.5
//         }],
//         learningRate: generateLearningRate(),
//         decisionMetrics: generateDecisionMetrics(),
//         socialDynamics: generateSocialDynamics(),
//         cognitiveLoad: generateCognitiveLoad()
//       }));
//     };

//     // Initial data
//     updateMetrics();
//     // Update every 2 seconds
//     const interval = setInterval(updateMetrics, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   // Helper functions to generate demo data
//   const generateTopicControl = () => [
//     { subject: 'Natural', value: Math.random() * 50 },
//     { subject: 'Forced', value: Math.random() * 20 },
//     { subject: 'User-led', value: Math.random() * 30 },
//     { subject: 'AI-led', value: Math.random() * 25 }
//   ];

//   const generatePredictions = () => [
//     { name: 'Question Intent', value: Math.random() },
//     { name: 'Info Sharing', value: Math.random() },
//     { name: 'Clarification Need', value: Math.random() },
//     { name: 'Topic Shift', value: Math.random() }
//   ];

//   const generateOptimization = () => [
//     { subject: 'Timing', value: Math.random() },
//     { subject: 'Relevance', value: Math.random() },
//     { subject: 'Depth', value: Math.random() },
//     { subject: 'Adaptability', value: Math.random() }
//   ];

//   const generateLearningRate = () => [
//     { session: 1, baseline: 0.5 + Math.random() * 0.2, adapted: 0.6 + Math.random() * 0.2 },
//     { session: 2, baseline: 0.6 + Math.random() * 0.2, adapted: 0.7 + Math.random() * 0.2 },
//     { session: 3, baseline: 0.7 + Math.random() * 0.2, adapted: 0.8 + Math.random() * 0.2 }
//   ];

//   const generateDecisionMetrics = () => [
//     { category: 'Response Time', value: Math.random() * 100 },
//     { category: 'Context Recall', value: Math.random() * 100 },
//     { category: 'Pattern Recognition', value: Math.random() * 100 },
//     { category: 'Action Selection', value: Math.random() * 100 }
//   ];

//   const generateSocialDynamics = () => [
//     { name: 'Rapport', value: Math.random() * 100 },
//     { name: 'Trust', value: Math.random() * 100 },
//     { name: 'Engagement', value: Math.random() * 100 },
//     { name: 'Understanding', value: Math.random() * 100 }
//   ];

//   const generateCognitiveLoad = () => [
//     { time: '1', load: Math.random() * 100 },
//     { time: '2', load: Math.random() * 100 },
//     { time: '3', load: Math.random() * 100 },
//     { time: '4', load: Math.random() * 100 },
//     { time: '5', load: Math.random() * 100 }
//   ];

//   const MetricCard = ({ title, value, color = 'bg-blue-500' }) => (
//     <div className="bg-gray-900 p-4 rounded-lg">
//       <h4 className="text-sm font-medium text-gray-400">{title}</h4>
//       <div className="mt-2 flex justify-between items-center">
//         <span className="text-2xl font-bold text-gray-100">{value}</span>
//         <div className={`h-2 w-24 bg-gray-800 rounded-full overflow-hidden`}>
//           <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="w-full p-6 bg-gray-900">
//       {/* Time Range Selector */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-100">Autonomous Behavior Analytics</h1>
//         <select 
//           value={TimeRanges}
//           onChange={(e) => setTimeRange(e.target.value)}
//           className="bg-gray-800 text-gray-100 rounded px-3 py-1 border border-gray-700"
//         >
//           <option value="1h">Last Hour</option>
//           <option value="6h">Last 6 Hours</option>
//           <option value="24h">Last 24 Hours</option>
//         </select>
//       </div>

//       {/* Key Metrics Overview */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         <MetricCard 
//           title="Average Initiative" 
//           value={Math.round(metrics.conversationalFlow.reduce((acc, curr) => acc + curr.initiative, 0) / 
//             Math.max(metrics.conversationalFlow.length, 1) * 100)} 
//           color="bg-blue-500"
//         />
//         <MetricCard 
//           title="Emotional Intelligence" 
//           value={Math.round(metrics.emotionalTrends.reduce((acc, curr) => acc + curr.empathy, 0) / 
//             Math.max(metrics.emotionalTrends.length, 1) * 100)}
//           color="bg-green-500"
//         />
//         <MetricCard 
//           title="Learning Efficiency" 
//           value={Math.round(metrics.learningRate.reduce((acc, curr) => acc + curr.adapted, 0) / 
//             Math.max(metrics.learningRate.length, 1) * 100)}
//           color="bg-yellow-500"
//         />
//         <MetricCard 
//           title="Social Dynamics" 
//           value={Math.round(metrics.socialDynamics.reduce((acc, curr) => acc + curr.value, 0) / 
//             Math.max(metrics.socialDynamics.length, 1))}
//           color="bg-purple-500"
//         />
//       </div>

//       {/* Main Charts Grid */}
//       <div className="grid grid-cols-2 gap-6">
//         {/* Conversation Flow */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 text-gray-100">Real-time Conversation Flow</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={metrics.conversationalFlow}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="time" stroke="#D1D5DB" />
//                 <YAxis stroke="#D1D5DB" />
//                 <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F9FAFB' }} />
//                 <Legend />
//                 <Area type="monotone" dataKey="initiative" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
//                 <Area type="monotone" dataKey="responsiveness" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
//                 <Area type="monotone" dataKey="engagement" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Next Action Predictions */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 text-gray-100">Next Action Predictions</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={metrics.predictions} layout="vertical">
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis type="number" stroke="#D1D5DB" />
//                 <YAxis dataKey="name" type="category" stroke="#D1D5DB" />
//                 <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F9FAFB' }} />
//                 <Legend />
//                 <Bar dataKey="value" fill="#3B82F6" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Social Dynamics */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 text-gray-100">Social Dynamics</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <RadarChart data={metrics.socialDynamics}>
//                 <PolarGrid stroke="#374151" />
//                 <PolarAngleAxis dataKey="name" stroke="#D1D5DB" />
//                 <Radar name="Social Metrics" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
//               </RadarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Cognitive Load */}
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 text-gray-100">Cognitive Load Analysis</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={metrics.cognitiveLoad}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="time" stroke="#D1D5DB" />
//                 <YAxis stroke="#D1D5DB" />
//                 <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F9FAFB' }} />
//                 <Line type="monotone" dataKey="load" stroke="#EC4899" strokeWidth={2} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BehaviorMetrics;

// function setMetrics(arg0: (prev: any) => { conversationalFlow: any[]; topicControl: { subject: string; value: number; }[]; predictions: { name: string; value: number; }[]; optimization: { subject: string; value: number; }[]; emotionalTrends: any[]; learningRate: { session: number; baseline: number; adapted: number; }[]; decisionMetrics: { category: string; value: number; }[]; socialDynamics: { name: string; value: number; }[]; cognitiveLoad: { time: string; load: number; }[]; }) {
//     throw new Error('Function not implemented.');
// }
