import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar
} from 'recharts';
import {
  Activity,
  Brain,
  Database,
  Mic,
  Volume2,
  VolumeX,
  Power,
  MessageCircle,
  BrainCircuit,
  Gauge
} from 'lucide-react';

type ThoughtType = 'internal' | 'external';
type ActivityType = 'memory' | 'speech';

interface ThoughtStreamItem {
  time: string;
  intensity: number;
  type: ThoughtType;
  content: string;
}

interface MemoryActivityItem {
  time: string;
  reads: number;
  writes: number;
}

interface ActivityItem {
  id: number;
  content: string;
  timestamp: string;
  type: ActivityType;
}

interface AutonomyMetrics {
  initiative: {
    selfInitiated: number;
    responseRequired: number;
    observationOnly: number;
  };
  thoughtStream: ThoughtStreamItem[];
  memoryActivity: MemoryActivityItem[];
  currentState: {
    curiosity: number;
    focus: number;
    creativity: number;
    engagement: number;
  };
}

interface OperationalMetrics {
  pendingQuestions: string[];
  lastResponse: string;
  memoryWrites: ActivityItem[];
  vocalizations: ActivityItem[];
  currentThought: string | null;
}

const AutonomousInterface = () => {
  const [systemState, setSystemState] = useState({
    running: false,
    audioOutput: true,
    audioInput: false,
    processingThought: false
  });

  const [autonomyMetrics, setAutonomyMetrics] = useState<AutonomyMetrics>({
    initiative: {
      selfInitiated: 28,
      responseRequired: 45,
      observationOnly: 12
    },
    thoughtStream: [],
    memoryActivity: [],
    currentState: {
      curiosity: 0.7,
      focus: 0.8,
      creativity: 0.6,
      engagement: 0.75
    }
  });

  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({
    pendingQuestions: [],
    lastResponse: '',
    memoryWrites: [],
    vocalizations: [],
    currentThought: null
  });

  // Simulate real-time autonomous behavior
  useEffect(() => {
    if (!systemState.running) return;

    const interval = setInterval(() => {
      // Update thought stream with proper typing
      const newThought: ThoughtStreamItem = {
        time: new Date().toLocaleTimeString(),
        intensity: 0.3 + Math.random() * 0.7,
        type: Math.random() > 0.7 ? 'external' : 'internal',
        content: `Autonomous thought #${Math.floor(Math.random() * 100)}`
      };

      const newMemoryActivity: MemoryActivityItem = {
        time: new Date().toLocaleTimeString(),
        reads: Math.floor(Math.random() * 5),
        writes: Math.floor(Math.random() * 3)
      };

      setAutonomyMetrics(prev => ({
        ...prev,
        thoughtStream: [...prev.thoughtStream, newThought].slice(-20),
        memoryActivity: [...prev.memoryActivity, newMemoryActivity].slice(-20)
      }));

      // Simulate memory and vocalization events with proper typing
      const isMemoryWrite = Math.random() > 0.7;
      const isVocalization = Math.random() > 0.9;

      if (isMemoryWrite || isVocalization) {
        setOperationalMetrics(prev => {
          const updates: Partial<OperationalMetrics> = {};

          if (isMemoryWrite) {
            const newMemory: ActivityItem = {
              id: Date.now(),
              content: `Memory: Observed pattern ${Math.floor(Math.random() * 100)}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'memory'
            };
            updates.memoryWrites = [...prev.memoryWrites, newMemory].slice(-5);
          }

          if (isVocalization) {
            const newVocalization: ActivityItem = {
              id: Date.now(),
              content: `I've noticed something interesting about pattern ${Math.floor(Math.random() * 100)}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'speech'
            };
            updates.vocalizations = [...prev.vocalizations, newVocalization].slice(-3);
          }

          return { ...prev, ...updates };
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [systemState.running]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top Control Bar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSystemState(prev => ({ ...prev, running: !prev.running }))}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                systemState.running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Power size={16} />
              {systemState.running ? 'Stop' : 'Start'} Autonomous Mode
            </button>
            
            <button 
              onClick={() => setSystemState(prev => ({ ...prev, audioOutput: !prev.audioOutput }))}
              className={`p-2 rounded ${systemState.audioOutput ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {systemState.audioOutput ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button 
              onClick={() => setSystemState(prev => ({ ...prev, audioInput: !prev.audioInput }))}
              className={`p-2 rounded ${systemState.audioInput ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <Mic size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded text-sm">
            <Activity size={16} />
            Status: {systemState.running ? 
              <span className="text-green-400">Active</span> : 
              <span className="text-red-400">Inactive</span>
            }
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Control Panel */}
        <div className="w-80 border-r border-gray-700 p-4">
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-100 flex items-center gap-2">
                <BrainCircuit size={20} />
                Behavior Parameters
              </h3>
              <div className="space-y-4">
                {Object.entries(autonomyMetrics.currentState).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="capitalize">{key}</span>
                      <span>{(value * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={value}
                      className="w-full"
                      onChange={(e) => {
                        setAutonomyMetrics(prev => ({
                          ...prev,
                          currentState: {
                            ...prev.currentState,
                            [key]: parseFloat(e.target.value)
                          }
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-100">Response Thresholds</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Thought Generation Rate</label>
                  <input type="range" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Memory Write Threshold</label>
                  <input type="range" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Speech Threshold</label>
                  <input type="range" className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Thought Stream */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
                <Brain size={20} />
                Thought Stream
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={autonomyMetrics.thoughtStream}>
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
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory Activity */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
                <Database size={20} />
                Memory Activity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={autonomyMetrics.memoryActivity}>
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
                    <Bar dataKey="reads" fill="#3B82F6" name="Reads" />
                    <Bar dataKey="writes" fill="#10B981" name="Writes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
              <MessageCircle size={20} />
              Activity Stream
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {operationalMetrics.memoryWrites.map(memory => (
                <div key={memory.id} className="bg-purple-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Database size={14} />
                    <span>{memory.timestamp}</span>
                  </div>
                  <div className="text-gray-100 mt-1">{memory.content}</div>
                </div>
              ))}
              {operationalMetrics.vocalizations.map(vocal => (
                <div key={vocal.id} className="bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Volume2 size={14} />
                    <span>{vocal.timestamp}</span>
                  </div>
                  <div className="text-gray-100 mt-1">{vocal.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Stats Panel */}
        <div className="w-80 border-l border-gray-700 p-4">
          <h2 className="text-xl text-gray-100 mb-4 flex items-center gap-2">
            <Gauge size={24} />
            Performance Metrics
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-100">Initiative Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(autonomyMetrics.initiative).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded">
                      <div 
                        className="h-full bg-blue-500 rounded" 
                        style={{width: `${(value / 100) * 100}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-100">Current State</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[autonomyMetrics.currentState]}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                    />
                    <Radar 
                      name="State" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.5} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousInterface;