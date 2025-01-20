// // client/src/components/SystemControls.tsx
// // import React from 'react';
// import { useState } from 'react';
// import { Power, AlertCircle, CheckCircle, Loader, Settings } from 'lucide-react';
// import { ModelStatus } from '../types';
// import { useModel } from '../context/ModelContext';
// import { useAsyncAction } from '../hooks/useAsyncAction';
// import ApiService from '../services/api';
// import type { ModelState } from '../types';

// interface SystemControlsProps {
//     model: string;
//     state: ModelState;
//     onToggle: () => Promise<void>;
// }

// // export const SystemControls = ({ model, state, onToggle }: SystemControlsProps) => {
// //     const [isActive, setIsActive] = useState(false);
// //     const getStatusIcon = useCallback(() => <Activity className="w-4 h-4" />, []);
  
// //     return (
// //         <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
// //           <div className="flex items-center justify-between mb-4">
// //             <div className="flex items-center space-x-4">
// //               {/* Status Indicator */}
// //               <div className="flex items-center space-x-2">
// //                 <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
// //                 <span className="text-sm font-medium">{state.status}</span>
// //               </div>
    
// //               {/* Model Info */}
// //               <div className="text-sm text-gray-400">
// //                 Model: {state.settings?.model || 'Not Selected'}
// //               </div>
// //             </div>
    
// //             {/* System Power Control */}
// //             <button
// //               onClick={() => toggleSystem()}
// //               disabled={isLoading}
// //               className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
// //                 state.status === ModelStatus.READY
// //                   ? 'bg-red-600 hover:bg-red-700'
// //                   : 'bg-green-600 hover:bg-green-700'
// //               } disabled:opacity-50 disabled:cursor-not-allowed`}
// //             >
// //               {isLoading ? (
// //                 <Loader className="w-4 h-4 animate-spin" />
// //               ) : (
// //                 <Power className="w-4 h-4" />
// //               )}
// //               <span>{state.status === ModelStatus.READY ? 'Stop' : 'Start'}</span>
// //             </button>
// //           </div>
    
// //           {/* Error Message */}
// //           {error && (
// //             <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm flex items-center space-x-2">
// //               <AlertCircle className="w-4 h-4" />
// //               <span>{error}</span>
// //             </div>
// //           )}
    
// //           {/* System Stats */}
// //           <div className="grid grid-cols-3 gap-4 mt-4">
// //             {state.status === ModelStatus.READY && (
// //               <>
// //                 <div className="bg-gray-700 p-2 rounded">
// //                   <div className="text-xs text-gray-400">Uptime</div>
// //                   <div className="text-sm font-medium">
// //                     {Math.floor(state.uptime / 3600)}h {Math.floor((state.uptime % 3600) / 60)}m
// //                   </div>
// //                 </div>
// //                 <div className="bg-gray-700 p-2 rounded">
// //                   <div className="text-xs text-gray-400">Memory Usage</div>
// //                   <div className="text-sm font-medium">
// //                     {Math.round(state.memory_usage?.rss || 0)}MB
// //                   </div>
// //                 </div>
// //                 <div className="bg-gray-700 p-2 rounded">
// //                   <div className="text-xs text-gray-400">CPU Usage</div>
// //                   <div className="text-sm font-medium">
// //                     {Math.round(state.cpu_usage || 0)}%
// //                   </div>
// //                 </div>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       );
// // };

// export const SystemControls = ({ model, state, onToggle }: SystemControlsProps) => {
//     const [isActive, setIsActive] = useState(false);
//     // const getStatusIcon = useCallback(() => <Activity className="w-4 h-4" />, []);

//   const {
//     execute: toggleSystem,
//     isLoading,
//     error
//   } = useAsyncAction(async () => {
//     if (state.status === ModelStatus.STOPPED) {
//       await ApiService.startModel('DarkIdol-Llama-3_1');
//     } else {
//       await ApiService.stopModel();
//     }
//     refreshStatus();
//   });

//   const getStatusColor = () => {
//     switch (state.status) {
//       case ModelStatus.READY:
//         return 'bg-green-500';
//       case ModelStatus.ERROR:
//         return 'bg-red-500';
//       case ModelStatus.PROCESSING:
//         return 'bg-yellow-500';
//       default:
//         return 'bg-gray-500';
//     }
//   };

//   const getStatusIcon = () => {
//     switch (state.status) {
//       case ModelStatus.READY:
//         return <CheckCircle className="w-4 h-4" />;
//       case ModelStatus.ERROR:
//         return <AlertCircle className="w-4 h-4" />;
//       case ModelStatus.PROCESSING:
//         return <Loader className="w-4 h-4 animate-spin" />;
//       default:
//         return <Settings className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-4">
//           {/* Status Indicator */}
//           <div className="flex items-center space-x-2">
//             <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
//             <span className="text-sm font-medium">{state.status}</span>
//           </div>

//           {/* Model Info */}
//           <div className="text-sm text-gray-400">
//             Model: {state.settings?.model || 'Not Selected'}
//           </div>
//         </div>

//         {/* System Power Control */}
//         <button
//           onClick={() => toggleSystem()}
//           disabled={isLoading}
//           className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
//             state.status === ModelStatus.READY
//               ? 'bg-red-600 hover:bg-red-700'
//               : 'bg-green-600 hover:bg-green-700'
//           } disabled:opacity-50 disabled:cursor-not-allowed`}
//         >
//           {isLoading ? (
//             <Loader className="w-4 h-4 animate-spin" />
//           ) : (
//             <Power className="w-4 h-4" />
//           )}
//           <span>{state.status === ModelStatus.READY ? 'Stop' : 'Start'}</span>
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm flex items-center space-x-2">
//           <AlertCircle className="w-4 h-4" />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* System Stats */}
//       <div className="grid grid-cols-3 gap-4 mt-4">
//         {state.status === ModelStatus.READY && (
//           <>
//             <div className="bg-gray-700 p-2 rounded">
//               <div className="text-xs text-gray-400">Uptime</div>
//               <div className="text-sm font-medium">
//                 {Math.floor(state.uptime / 3600)}h {Math.floor((state.uptime % 3600) / 60)}m
//               </div>
//             </div>
//             <div className="bg-gray-700 p-2 rounded">
//               <div className="text-xs text-gray-400">Memory Usage</div>
//               <div className="text-sm font-medium">
//                 {Math.round(state.memory_usage?.rss || 0)}MB
//               </div>
//             </div>
//             <div className="bg-gray-700 p-2 rounded">
//               <div className="text-xs text-gray-400">CPU Usage</div>
//               <div className="text-sm font-medium">
//                 {Math.round(state.cpu_usage || 0)}%
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SystemControls;