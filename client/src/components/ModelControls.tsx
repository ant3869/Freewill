import React from 'react';
import { Volume2, VolumeX, Mic, Settings } from 'lucide-react';

interface ModelControlsProps {
  onSettingsChange: (settings: any) => void;
  settings: {
    temperature: number;
    topP: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
  };
}

const ModelControls: React.FC<ModelControlsProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (key: string, value: number | string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Model Response Settings */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings size={18} />
          Model Settings
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Temperature</label>
              <span>{settings.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Controls randomness: 0 = deterministic, 2 = maximum creativity</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Top P</label>
              <span>{settings.topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.topP}
              onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Controls diversity via nucleus sampling</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Max Tokens</label>
              <span>{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="1"
              max="2048"
              step="1"
              value={settings.maxTokens}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum length of generated response</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Frequency Penalty</label>
              <span>{settings.frequencyPenalty.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.01"
              value={settings.frequencyPenalty}
              onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Reduces repetition of token sequences</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Presence Penalty</label>
              <span>{settings.presencePenalty.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.01"
              value={settings.presencePenalty}
              onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">Encourages discussion of new topics</p>
          </div>
        </div>
      </div>

      {/* Prompt Templates */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-4">Prompt Templates</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm mb-1 block">System Prompt</label>
            <textarea
              className="w-full bg-gray-700 rounded p-2 text-sm"
              rows={3}
              placeholder="You are a helpful AI assistant..."
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">User Prompt Template</label>
            <textarea
              className="w-full bg-gray-700 rounded p-2 text-sm"
              rows={3}
              placeholder="Question: {user_input}\nAnswer:"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Assistant Prompt Template</label>
            <textarea
              className="w-full bg-gray-700 rounded p-2 text-sm"
              rows={3}
              placeholder="I am a helpful assistant..."
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-2 mt-2">
            Update Prompts
          </button>
        </div>
      </div>

      {/* Text-to-Speech Controls */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Volume2 size={18} />
          Speech Settings
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm">Voice</label>
              <select className="bg-gray-700 rounded px-2 py-1 text-sm">
                <option>Natural (Default)</option>
                <option>Professional</option>
                <option>Casual</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Speed</label>
              <span>1.0x</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Pitch</label>
              <span>1.0</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded py-2 flex items-center justify-center gap-2">
              <Volume2 size={16} />
              Test Voice
            </button>
            <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded py-2 flex items-center justify-center gap-2">
              <VolumeX size={16} />
              Stop
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Voice Input</span>
            <button className="bg-gray-700 hover:bg-gray-600 rounded-full p-2">
              <Mic size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelControls;