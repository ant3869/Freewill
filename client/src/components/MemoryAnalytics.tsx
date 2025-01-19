import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MemoryNode {
  id: string;
  type: 'memory' | 'connection';
  strength: number;
  connections: number[];
  state: 'active' | 'inactive';
}

interface Connection {
  id: string;
  source: string;
  target: string;
  strength: number;
}

interface Animation {
  nodeId: string;
  type: 'pulse' | 'fade' | 'highlight';
  duration: number;
}

interface MemoryState {
  nodes: MemoryNode[];
  connections: Connection[];
  selectedNode: string | null;
  animation: Animation | null;
}

interface NodeClickEvent {
  id: string;
  type: 'memory' | 'connection';
  strength: number;
}

const MemoryAnalytics: React.FC = () => {
  const [memoryState, setMemoryState] = useState<MemoryState>({
    nodes: [],
    connections: [],
    selectedNode: null,
    animation: null
  });

  const setSelectedNode = useCallback((nodeId: string | null) => {
    setMemoryState(prev => ({
      ...prev,
      selectedNode: nodeId
    }));
  }, []);

  const setConnections = useCallback((connections: Connection[]) => {
    setMemoryState(prev => ({
      ...prev,
      connections
    }));
  }, []);

  const setMemoryNodes = useCallback((nodes: MemoryNode[]) => {
    setMemoryState(prev => ({
      ...prev,
      nodes
    }));
  }, []);

  const setAnimation = useCallback((animation: Animation | null) => {
    setMemoryState(prev => ({
      ...prev,
      animation
    }));
  }, []);

  const generateConnection = useCallback((nodes: MemoryNode[]): Connection => {
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    const targetIndex = Math.floor(Math.random() * nodes.length);
    return {
      id: `conn-${Date.now()}`,
      source: nodes[sourceIndex].id,
      target: nodes[targetIndex].id,
      strength: Math.random()
    };
  }, []);

  const updateMemoryNodes = useCallback(() => {
    const newNode: MemoryNode = {
      id: `node-${Date.now()}`,
      type: Math.random() > 0.5 ? 'memory' : 'connection',
      strength: Math.random(),
      connections: [],
      state: 'active'
    };

    setMemoryState(prev => {
      const updatedNodes = [...prev.nodes, newNode].slice(-20);
      
      // Create new connections
      if (updatedNodes.length > 1 && Math.random() > 0.5) {
        const newConnection = generateConnection(updatedNodes);
        if (newConnection.source !== newConnection.target) {
          // Update node connections
          const sourceIndex = updatedNodes.findIndex(n => n.id === newConnection.source);
          const targetIndex = updatedNodes.findIndex(n => n.id === newConnection.target);
          
          if (sourceIndex !== -1 && targetIndex !== -1) {
            updatedNodes[sourceIndex].connections.push(targetIndex);
            updatedNodes[targetIndex].connections.push(sourceIndex);
            
            return {
              ...prev,
              nodes: updatedNodes,
              connections: [...prev.connections, newConnection].slice(-20)
            };
          }
        }
      }
      
      return {
        ...prev,
        nodes: updatedNodes
      };
    });
  }, [generateConnection]);

  useEffect(() => {
    const interval = setInterval(updateMemoryNodes, 2000);
    return () => clearInterval(interval);
  }, [updateMemoryNodes]);

  // Animation loop
  useEffect(() => {
    if (!memoryState.animation) return;

    const timeout = setTimeout(() => {
      setAnimation(null);
    }, memoryState.animation.duration);

    return () => clearTimeout(timeout);
  }, [memoryState.animation, setAnimation]);

  const calculateAverageStrength = useCallback((nodes: MemoryNode[]): number => {
    if (nodes.length === 0) return 0;
    return nodes.reduce((sum, node) => sum + node.strength, 0) / nodes.length;
  }, []);

  const handleNodeClick = useCallback((data: NodeClickEvent) => {
    setSelectedNode(data.id);
    setAnimation({
      nodeId: data.id,
      type: 'highlight',
      duration: 1000
    });
  }, [setSelectedNode, setAnimation]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Memory Analytics</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={memoryState.nodes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="id" 
              stroke="#9CA3AF"
              tickFormatter={(value: string) => value.split('-')[1]}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.375rem',
                color: '#E5E7EB'
              }}
            />
            <Bar 
              dataKey="strength" 
              fill={memoryState.animation ? '#10B981' : '#3B82F6'}
              onClick={(data) => handleNodeClick(data)}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-400">Active Nodes</div>
          <div className="text-xl text-gray-100">
            {memoryState.nodes.filter(n => n.state === 'active').length}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-400">Connections</div>
          <div className="text-xl text-gray-100">
            {memoryState.connections.length}
          </div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-400">Avg Strength</div>
          <div className="text-xl text-gray-100">
            {calculateAverageStrength(memoryState.nodes).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryAnalytics;

// // src/components/MemoryAnalytics.tsx
// import { useState, useEffect, useCallback } from 'react';
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Legend, Line, BarChart, Bar } from 'recharts';

// interface MemoryNode {
//   id: number;
//   type: string;
//   x: number;
//   y: number;
//   strength: number;
//   connections: number;
// }

// // interface MemoryNode {
// //   id: string;
// //   type: 'memory' | 'connection';
// //   strength: number;
// //   connections: number[];
// //   state: 'active' | 'inactive';
// // }

// interface Connection {
//   id: string;
//   source: string;
//   target: string;
//   strength: number;
// }

// interface Animation {
//   nodeId: string;
//   type: 'pulse' | 'fade' | 'highlight';
//   duration: number;
// }

// interface MemoryConnection {
//   source: string;
//   target: string;
//   strength: number;
// }

// interface MemoryState {
//   nodes: MemoryNode[];
//   connections: MemoryConnection[];
//   metrics: {
//     totalNodes: number;
//     activeConnections: number;
//     averageStrength: number;
//   };
// }

// // interface MemoryState {
// //   nodes: MemoryNode[];
// //   connections: Connection[];
// //   selectedNode: string | null;
// //   animation: Animation | null;
// // }

// interface NodeClickEvent {
//   id: string;
//   type: 'memory' | 'connection';
//   strength: number;
// }

// const MemoryAnalytics: React.FC = () => {
//   const [memoryState, setMemoryState] = useState<MemoryState>({
//     nodes: [],
//     connections: [],
//     selectedNode: null,
//     animation: null,
//     metrics: {
//       totalNodes: 0,
//       activeConnections: 0,
//       averageStrength: 0
//     }
//   });

//   const setSelectedNode = useCallback((nodeId: string | null) => {
//     setMemoryState(prev => ({
//       ...prev,
//       selectedNode: nodeId
//     }));
//   }, []);

//   const setConnections = useCallback((connections: Connection[]) => {
//     setMemoryState(prev => ({
//       ...prev,
//       connections
//     }));
//   }, []);

//   const setMemoryNodes = useCallback((nodes: MemoryNode[]) => {
//     setMemoryState(prev => ({
//       ...prev,
//       nodes
//     }));
//   }, []);

//   const setAnimation = useCallback((animation: Animation | null) => {
//     setMemoryState(prev => ({
//       ...prev,
//       animation
//     }));
//   }, []);

//   const updateMemoryState = (prevState: MemoryState): MemoryState => {
//     // Create a new node
//     const newNode: MemoryNode = {
//       id: prevState.nodes.length + 1,
//       type: Math.random() > 0.5 ? 'memory' : 'concept',
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       strength: Math.random(),
//       connections: Math.floor(Math.random() * 5)
//     };

//     // Update nodes array
//     const updatedNodes = [...prevState.nodes, newNode].slice(-20);

//     // Calculate new metrics
//     const totalNodes = updatedNodes.length;
//     const activeConnections = updatedNodes.reduce((sum, node) => sum + node.connections, 0);
//     const averageStrength = updatedNodes.reduce((sum, node) => sum + node.strength, 0) / totalNodes;

//     return {
//       nodes: updatedNodes,
//       connections: prevState.connections,
//       metrics: {
//         totalNodes,
//         activeConnections,
//         averageStrength
//       }
//     };
//   };

//   const handleNodeClick = (node) => {
//     setSelectedNode(selectedNode?.id === node.id ? null : node);
//     setAnimation('ping');
//     setTimeout(() => setAnimation('pulse'), 1000);
//   };

//   const refreshNetwork = () => {
//     const nodes = generateNodes();
//     setMemoryNodes(nodes);
//     setConnections(generateConnections(nodes));
//     setStats(prev => ({
//       ...prev,
//       activeMemories: prev.activeMemories + Math.floor(Math.random() * 5) - 2,
//       connections: prev.connections + Math.floor(Math.random() * 8) - 4
//     }));
//   };

//   const [data, setData] = useState([
//     { time: '00:00', coherence: 0.82, accuracy: 0.90, relevance: 0.75 },
//     { time: '00:05', coherence: 0.85, accuracy: 0.92, relevance: 0.78 },
//     { time: '00:10', coherence: 0.83, accuracy: 0.91, relevance: 0.77 },
//     { time: '00:15', coherence: 0.87, accuracy: 0.88, relevance: 0.82 },
//     { time: '00:20', coherence: 0.84, accuracy: 0.93, relevance: 0.80 }
//   ]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setData(prev => {
//         const newPoint = {
//           time: new Date().toLocaleTimeString('en-US', { 
//             hour12: false, 
//             hour: '2-digit', 
//             minute: '2-digit' 
//           }),
//           coherence: 0.7 + Math.random() * 0.3,
//           accuracy: 0.7 + Math.random() * 0.3,
//           relevance: 0.7 + Math.random() * 0.3
//         };
//         return [...prev.slice(1), newPoint];
//       });
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   const qualityMetrics = {
//     coherence: 0.85,
//     factualAccuracy: 0.92,
//     contextRelevance: 0.78,
//     creativity: 0.65,
//     consistency: 0.88
//   };

//   const getQualityColor = (score: number) => {
//     if (score >= 0.9) return 'bg-green-500';
//     if (score >= 0.7) return 'bg-blue-500';
//     if (score >= 0.5) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };
  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMemoryState(prevState => updateMemoryState(prevState));
//     }, 2000);

//     return () => clearInterval(interval);
//   }, []);

//   //   return (
//   //     <div className="bg-gray-800 p-4 rounded-lg">
//   //       <h3 className="text-lg font-semibold mb-4 text-gray-100">Memory Analytics</h3>
//   //       <div className="h-64">
//   //         <ResponsiveContainer width="100%" height="100%">
//   //           <BarChart data={memoryState.nodes}>
//   //             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//   //             <XAxis dataKey="id" stroke="#9CA3AF" />
//   //             <YAxis stroke="#9CA3AF" />
//   //             <Tooltip
//   //               contentStyle={{
//   //                 backgroundColor: '#1F2937',
//   //                 border: 'none',
//   //                 borderRadius: '0.375rem',
//   //                 color: '#E5E7EB'
//   //               }}
//   //             />
//   //             <Bar dataKey="strength" fill="#3B82F6" />
//   //             <Bar dataKey="connections" fill="#10B981" />
//   //           </BarChart>
//   //         </ResponsiveContainer>
//   //       </div>
        
//   //       <div className="mt-4 grid grid-cols-3 gap-4">
//   //         <div className="bg-gray-700 p-3 rounded">
//   //           <div className="text-sm text-gray-400">Total Nodes</div>
//   //           <div className="text-xl text-gray-100">{memoryState.metrics.totalNodes}</div>
//   //         </div>
//   //         <div className="bg-gray-700 p-3 rounded">
//   //           <div className="text-sm text-gray-400">Active Connections</div>
//   //           <div className="text-xl text-gray-100">{memoryState.metrics.activeConnections}</div>
//   //         </div>
//   //         <div className="bg-gray-700 p-3 rounded">
//   //           <div className="text-sm text-gray-400">Avg Strength</div>
//   //           <div className="text-xl text-gray-100">
//   //             {memoryState.metrics.averageStrength.toFixed(2)}
//   //           </div>
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // };

//   const updateMemoryNodes = useCallback(() => {
//     const newNode: MemoryNode = {
//       id: `node-${Date.now()}`,
//       type: Math.random() > 0.5 ? 'memory' : 'connection',
//       strength: Math.random(),
//       connections: [],
//       state: 'active'
//     };

//     setMemoryState(prev => {
//       const updatedNodes = [...prev.nodes, newNode].slice(-20);
      
//       // Create new connections
//       if (updatedNodes.length > 1 && Math.random() > 0.5) {
//         const newConnection = newConnection(updatedNodes);
//         if (newConnection.source !== newConnection.target) {
//           // Update node connections
//           const sourceIndex = updatedNodes.findIndex(n => n.id === newConnection.source);
//           const targetIndex = updatedNodes.findIndex(n => n.id === newConnection.target);
          
//           if (sourceIndex !== -1 && targetIndex !== -1) {
//             updatedNodes[sourceIndex].connections.push(targetIndex);
//             updatedNodes[targetIndex].connections.push(sourceIndex);
            
//             return {
//               ...prev,
//               nodes: updatedNodes,
//               connections: [...prev.connections, newConnection].slice(-20)
//             };
//           }
//         }
//       }
      
//       return {
//         ...prev,
//         nodes: updatedNodes
//       };
//     });
//   }, [generateConnection]);

//   useEffect(() => {
//     const interval = setInterval(updateMemoryNodes, 2000);
//     return () => clearInterval(interval);
//   }, [updateMemoryNodes]);

//   // Animation loop
//   useEffect(() => {
//     if (!memoryState.animation) return;

//     const timeout = setTimeout(() => {
//       setAnimation(null);
//     }, memoryState.animation.duration);

//     return () => clearTimeout(timeout);
//   }, [memoryState.animation, setAnimation]);

//   const calculateAverageStrength = useCallback((nodes: MemoryNode[]): number => {
//     if (nodes.length === 0) return 0;
//     return nodes.reduce((sum, node) => sum + node.strength, 0) / nodes.length;
//   }, []);

//   const handleNodeClick = useCallback((data: NodeClickEvent) => {
//     setSelectedNode(data.id);
//     setAnimation({
//       nodeId: data.id,
//       type: 'highlight',
//       duration: 1000
//     });
//   }, [setSelectedNode, setAnimation]);


//   return (
//     <div className="w-full max-w-4xl mx-auto space-y-6 p-4 bg-gray-900">
//       {/* Quality Metrics */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h3 className="text-lg font-semibold mb-4 text-white">Response Quality Metrics</h3>
//         <div className="grid grid-cols-2 gap-4">
//           {Object.entries(qualityMetrics).map(([metric, value]) => (
//             <div key={metric} className="bg-gray-900 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200">
//               <span className="block text-sm mb-2 text-gray-300 capitalize">
//                 {metric.replace(/([A-Z])/g, ' $1').trim()}
//               </span>
//               <div className="flex items-center gap-2">
//                 <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
//                   <div 
//                     className={`h-full ${getQualityColor(value)} rounded transition-all duration-500`}
//                     style={{width: `${value * 100}%`}}
//                   />
//                 </div>
//                 <span className="text-sm text-gray-300">{(value * 100).toFixed(0)}%</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Performance Graph */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h3 className="text-lg font-semibold mb-4 text-white">Performance Trends</h3>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//               <XAxis dataKey="time" stroke="#9CA3AF" />
//               <YAxis stroke="#9CA3AF" domain={[0.5, 1]} />
//               <Tooltip 
//                 contentStyle={{ 
//                   backgroundColor: '#1F2937',
//                   border: 'none',
//                   borderRadius: '0.375rem',
//                   color: '#E5E7EB'
//                 }}
//               />
//               <Legend />
//               <Line 
//                 type="monotone" 
//                 dataKey="coherence" 
//                 stroke="#3B82F6" 
//                 strokeWidth={2}
//                 dot={false}
//                 animationDuration={500}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="accuracy" 
//                 stroke="#10B981" 
//                 strokeWidth={2}
//                 dot={false}
//                 animationDuration={500}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="relevance" 
//                 stroke="#F59E0B" 
//                 strokeWidth={2}
//                 dot={false}
//                 animationDuration={500}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Memory Network */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-white">Memory Network</h3>
//           <div className="flex gap-2">
//             <button 
//               onClick={refreshNetwork}
//               className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition-colors duration-200"
//             >
//               Refresh
//             </button>
//             <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm transition-colors duration-200">
//               Filter
//             </button>
//           </div>
//         </div>
        
//         <div className="relative h-64 bg-gray-900 rounded-lg p-4 overflow-hidden">
//           {/* Connection Lines */}
//           <svg className="absolute inset-0 w-full h-full pointer-events-none">
//             {connections.map((conn, i) => {
//               const source = memoryNodes[conn.source];
//               const target = memoryNodes[conn.target];
//               if (!source || !target) return null;
//               return (
//                 <line
//                   key={i}
//                   x1={`${source.x}%`}
//                   y1={`${source.y}%`}
//                   x2={`${target.x}%`}
//                   y2={`${target.y}%`}
//                   stroke="#4B5563"
//                   strokeWidth="1"
//                   strokeOpacity={conn.strength}
//                 />
//               );
//             })}
//           </svg>

//           {/* Memory Nodes */}
//           {memoryNodes.map((node) => (
//             <div
//               key={node.id}
//               onClick={() => handleNodeClick(node)}
//               className={`absolute w-3 h-3 rounded-full cursor-pointer
//                 ${node.type === 'context' ? 'bg-blue-500' :
//                   node.type === 'fact' ? 'bg-green-500' :
//                   'bg-yellow-500'}
//                 ${selectedNode?.id === node.id ? animation : 'animate-pulse'}
//                 hover:ring-2 hover:ring-white hover:ring-opacity-50
//                 transition-all duration-500 ease-in-out`}
//               style={{
//                 left: `${node.x}%`,
//                 top: `${node.y}%`,
//                 opacity: node.strength,
//                 transform: 'translate(-50%, -50%)'
//               }}
//             />
//           ))}
          
//           {/* Selected Node Info */}
//           {selectedNode && (
//             <div className="absolute bottom-4 left-4 bg-gray-800 p-2 rounded text-sm">
//               <div className="text-white">Node #{selectedNode.id}</div>
//               <div className="text-gray-400">Type: {selectedNode.type}</div>
//               <div className="text-gray-400">Connections: {selectedNode.connections}</div>
//               <div className="text-gray-400">Strength: {(selectedNode.strength * 100).toFixed(0)}%</div>
//             </div>
//           )}
          
//           {/* Legend */}
//           <div className="absolute bottom-4 right-4 bg-gray-800 p-2 rounded">
//             <div className="flex items-center gap-2 text-sm">
//               <span className="w-2 h-2 rounded-full bg-blue-500" />
//               <span className="text-gray-300">Context</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <span className="w-2 h-2 rounded-full bg-green-500" />
//               <span className="text-gray-300">Fact</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <span className="w-2 h-2 rounded-full bg-yellow-500" />
//               <span className="text-gray-300">Conversation</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Memory Stats */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h3 className="text-lg font-semibold mb-4 text-white">Memory Statistics</h3>
//         <div className="grid grid-cols-4 gap-4">
//           <div className="text-center">
//             <span className="block text-2xl font-bold text-blue-400">{stats.activeMemories}</span>
//             <span className="text-sm text-gray-400">Active Memories</span>
//           </div>
//           <div className="text-center">
//             <span className="block text-2xl font-bold text-green-400">{stats.connections}</span>
//             <span className="text-sm text-gray-400">Connections</span>
//           </div>
//           <div className="text-center">
//             <span className="block text-2xl font-bold text-yellow-400">{stats.recentAccess}</span>
//             <span className="text-sm text-gray-400">Recent Access</span>
//           </div>
//           <div className="text-center">
//             <span className="block text-2xl font-bold text-purple-400">{stats.avgStrength}%</span>
//             <span className="text-sm text-gray-400">Avg Strength</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MemoryAnalytics;

// // function setAnimation(arg0: string) {
// //   throw new Error('Function not implemented.');
// // }
// // function setSelectedNode(arg0: any) {
// //   throw new Error('Function not implemented.');
// // }

// function generateNodes() {
//   throw new Error('Function not implemented.');
// }

// // function setMemoryNodes(nodes: any) {
// //   throw new Error('Function not implemented.');
// // }

// // function setConnections(arg0: any) {
// //   throw new Error('Function not implemented.');
// //}

// function generateConnections(nodes: any): any {
//   throw new Error('Function not implemented.');
// }

// function setStats(arg0: (prev: any) => any) {
//   throw new Error('Function not implemented.');
// }

