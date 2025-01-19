import React, { useState } from 'react';
import { Upload, Play, Pause, RotateCcw, Database, Settings2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FineTuningPanelProps {
  onStartTraining: () => void;
  onStopTraining: () => void;
  onUploadDataset: (file: File) => void;
}

const FineTuningPanel: React.FC<FineTuningPanelProps> = ({
  onStartTraining,
  onStopTraining,
  onUploadDataset,
}) => {
  const [activeTab, setActiveTab] = useState('prep');
  const [trainingConfig, setTrainingConfig] = useState({
    learningRate: 0.0001,
    epochs: 3,
    batchSize: 8,
    warmupSteps: 100,
  });

  const [dataStats, setDataStats] = useState({
    totalSamples: 0,
    validSamples: 0,
    invalidSamples: 0,
    avgLength: 0
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 rounded text-gray-100 ${
              activeTab === 'prep' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            Data Preparation
          </button>
          <button
            onClick={() => setActiveTab('train')}
            className={`px-4 py-2 rounded text-gray-100 ${
              activeTab === 'train' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            Training
          </button>
        </div>

        {/* Dataset Upload Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database size={20} />
            Training Data
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input type="file" className="hidden" id="dataset-upload" onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadDataset(e.target.files[0]);
                }
              }} />
              <label htmlFor="dataset-upload" className="cursor-pointer">
                <Upload size={24} className="mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Drop your dataset here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JSONL format
                </p>
              </label>
            </div>
          </div>
        </div>

        {activeTab === 'prep' ? (
          <div className="bg-gray-800 p-4 rounded-lg">
            {/* Data Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Total Samples</div>
                <div className="text-2xl font-bold text-gray-100">{dataStats.totalSamples}</div>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Valid Samples</div>
                <div className="text-2xl font-bold text-green-400">{dataStats.validSamples}</div>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Invalid Samples</div>
                <div className="text-2xl font-bold text-red-400">{dataStats.invalidSamples}</div>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Avg Length</div>
                <div className="text-2xl font-bold text-blue-400">{dataStats.avgLength}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Text Processing */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-gray-100">Text Processing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Remove Special Characters</span>
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Normalize Case</span>
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Strip Whitespace</span>
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Data Filtering */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <h4 className="text-md font-semibold mb-3 text-gray-100">Data Filtering</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Min Length</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800 rounded px-2 py-1 text-gray-100"
                      defaultValue={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Max Length</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800 rounded px-2 py-1 text-gray-100"
                      defaultValue={512}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 py-2 rounded text-gray-100 flex items-center justify-center gap-2">
                <FileText size={16} />
                Export Clean Data
              </button>
              <button className="flex-1 bg-green-600 py-2 rounded text-gray-100 flex items-center justify-center gap-2">
                <Database size={16} />
                Save to Training Set
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Training Configuration */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Training Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Learning Rate</label>
                  <input
                    type="number"
                    value={trainingConfig.learningRate}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      learningRate: parseFloat(e.target.value)
                    })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    step="0.0001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Epochs</label>
                  <input
                    type="number"
                    value={trainingConfig.epochs}
                    onChange={(e) => setTrainingConfig({
                      ...trainingConfig,
                      epochs: parseInt(e.target.value)
                    })}
                    className="w-full bg-gray-700 rounded px-3 py-2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Batch Size</label>
                  <select className="w-full bg-gray-700 rounded px-3 py-2 text-gray-100">
                    <option>8</option>
                    <option>16</option>
                    <option>32</option>
                    <option>64</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Training Progress */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Training Progress</h3>
                <div className="flex gap-2">
                  <button
                    onClick={onStartTraining}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <Play size={16} />
                    Start
                  </button>
                  <button
                    onClick={onStopTraining}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded flex items-center gap-2"
                  >
                    <Pause size={16} />
                    Stop
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-100 mb-1">
                    <span>Progress</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded">
                    <div className="h-full w-2/3 bg-blue-600 rounded"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


//   return (
//     <div className="p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Database size={20} />
//             Training Data
//           </h3>
//           <div className="space-y-4">
//             <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
//               <input type="file" className="hidden" id="dataset-upload" onChange={(e) => {
//                 if (e.target.files?.[0]) {
//                   onUploadDataset(e.target.files[0]);
//                 }
//               }} />
//               <label htmlFor="dataset-upload" className="cursor-pointer">
//                 <Upload size={24} className="mx-auto mb-2" />
//                 <p className="text-sm text-gray-400">
//                   Drop your dataset here or click to upload
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Supports JSONL format
//                 </p>
//               </label>
//             </div>
//             <div className="space-y-2">
//               <div className="bg-gray-700 p-3 rounded flex justify-between items-center">
//                 <span>training_data.jsonl</span>
//                 <span className="text-sm text-gray-400">2.3MB</span>
//               </div>
//               <div className="bg-gray-700 p-3 rounded flex justify-between items-center">
//                 <span>validation_data.jsonl</span>
//                 <span className="text-sm text-gray-400">0.5MB</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Settings2 size={20} />
//             Training Configuration
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm mb-1">Learning Rate</label>
//               <input
//                 type="number"
//                 value={trainingConfig.learningRate}
//                 onChange={(e) => setTrainingConfig({
//                   ...trainingConfig,
//                   learningRate: parseFloat(e.target.value)
//                 })}
//                 className="w-full bg-gray-700 rounded px-3 py-2"
//                 step="0.0001"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Epochs</label>
//               <input
//                 type="number"
//                 value={trainingConfig.epochs}
//                 onChange={(e) => setTrainingConfig({
//                   ...trainingConfig,
//                   epochs: parseInt(e.target.value)
//                 })}
//                 className="w-full bg-gray-700 rounded px-3 py-2"
//                 min="1"
//               />
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Batch Size</label>
//               <input
//                 type="number"
//                 value={trainingConfig.batchSize}
//                 onChange={(e) => setTrainingConfig({
//                   ...trainingConfig,
//                   batchSize: parseInt(e.target.value)
//                 })}
//                 className="w-full bg-gray-700 rounded px-3 py-2"
//                 min="1"
//               />
//             </div>
//             <div>
//               <label className="block text-sm mb-1">Warmup Steps</label>
//               <input
//                 type="number"
//                 value={trainingConfig.warmupSteps}
//                 onChange={(e) => setTrainingConfig({
//                   ...trainingConfig,
//                   warmupSteps: parseInt(e.target.value)
//                 })}
//                 className="w-full bg-gray-700 rounded px-3 py-2"
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-800 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Progress</span>
//                 <span>45%</span>
//               </div>
//               <div className="w-full bg-gray-700 rounded h-2">
//                 <div className="bg-blue-600 h-full rounded" style={{width: '45%'}} />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div className="bg-gray-700 p-3 rounded">
//                 <span className="block text-gray-400">Current Loss</span>
//                 <span className="text-lg">0.245</span>
//               </div>
//               <div className="bg-gray-700 p-3 rounded">
//                 <span className="block text-gray-400">Learning Rate</span>
//                 <span className="text-lg">1e-4</span>
//               </div>
//               <div className="bg-gray-700 p-3 rounded">
//                 <span className="block text-gray-400">Epoch</span>
//                 <span className="text-lg">2/3</span>
//               </div>
//               <div className="bg-gray-700 p-3 rounded">
//                 <span className="block text-gray-400">Time Remaining</span>
//                 <span className="text-lg">1h 23m</span>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={onStartTraining}
//                 className="flex-1 bg-green-600 hover:bg-green-500 rounded py-2 flex items-center justify-center gap-2"
//               >
//                 <Play size={16} />
//                 Start Training
//               </button>
//               <button
//                 onClick={onStopTraining}
//                 className="flex-1 bg-red-600 hover:bg-red-500 rounded py-2 flex items-center justify-center gap-2"
//               >
//                 <Pause size={16} />
//                 Stop
//               </button>
//               <button className="bg-gray-700 hover:bg-gray-600 rounded py-2 px-4 flex items-center justify-center">
//                 <RotateCcw size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default FineTuningPanel;