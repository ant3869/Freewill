import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AutoMetrics1 = () => {
  const [timeRange, setTimeRange] = useState('1h');

  const autonomyData = {
    initiative: {
      selfInitiated: 28,
      responseRequired: 45,
      observationOnly: 12,
      decisionPoints: {
        speakDecisions: 42,
        listenDecisions: 35,
        pauseDecisions: 18,
        redirectDecisions: 15
      },
      conversationControl: {
        topicChanges: 8,
        questionAsking: 15,
        elaborations: 12,
        clarifications: 9
      }
    },
    socialAwareness: {
      contextualUnderstanding: 0.85,
      emotionalAlignment: 0.76,
      timingAppropriateness: 0.92,
      socialCueRecognition: 0.81,
      conversationBalance: 0.88
    },
    learningPatterns: {
      behavioralAdaptations: [
        { time: '10:00', adaptationScore: 0.65 },
        { time: '11:00', adaptationScore: 0.72 },
        { time: '12:00', adaptationScore: 0.78 },
        { time: '13:00', adaptationScore: 0.82 },
        { time: '14:00', adaptationScore: 0.85 }
      ],
      interactionLearning: {
        positiveReinforcement: 24,
        negativeReinforcement: 8,
        neutralInteractions: 18
      }
    },
    personalityMetrics: {
      curiosityLevel: 0.85,
      assertiveness: 0.65,
      empathy: 0.92,
      adaptability: 0.78
    },
    conversationPatterns: {
      timing: {
        averageResponseDelay: 1.2,
        appropriatePauses: 89,
        interruptions: 3,
        silenceMaintained: 15
      },
      engagement: {
        topicExploration: 0.82,
        followUpQuestions: 15,
        relevantElaborations: 23,
        tangentialExploration: 7
      }
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="w-full p-6 bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Autonomous Behavior Analytics</h2>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-900 text-gray-100 rounded px-3 py-1"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
        </div>

        {/* Initiative Breakdown */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-100">Initiative Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Self-Initiated', value: autonomyData.initiative.selfInitiated },
                      { name: 'Response Required', value: autonomyData.initiative.responseRequired },
                      { name: 'Observation', value: autonomyData.initiative.observationOnly }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {autonomyData.initiative.selfInitiated > 0 && COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-100">Decision Making</h3>
            <div className="space-y-3">
              {Object.entries(autonomyData.initiative.decisionPoints).map(([key, value]) => (
                <div key={key} className="bg-gray-900 p-3 rounded-lg">
                  <div className="flex justify-between text-gray-100">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full mt-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(value / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Awareness */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-100">Social Intelligence Metrics</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(autonomyData.socialAwareness).map(([key, value]) => (
              <div key={key} className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Patterns */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-100">Behavioral Adaptation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={autonomyData.learningPatterns.behavioralAdaptations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#D1D5DB" />
                <YAxis stroke="#D1D5DB" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="adaptationScore" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Adaptation Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversation Flow */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-100">Interaction Dynamics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-100">Timing & Flow</h4>
              <div className="space-y-3">
                {Object.entries(autonomyData.conversationPatterns.timing).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 p-3 rounded-lg">
                    <div className="flex justify-between text-gray-100">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{typeof value === 'number' ? 
                        value % 1 === 0 ? value : value.toFixed(1) + 's' : 
                        value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-2 text-gray-100">Engagement Quality</h4>
              <div className="space-y-3">
                {Object.entries(autonomyData.conversationPatterns.engagement).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 p-3 rounded-lg">
                    <div className="flex justify-between text-gray-100">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{typeof value === 'number' ? 
                        value > 1 ? value : (value * 100).toFixed(0) + '%' : 
                        value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoMetrics1;