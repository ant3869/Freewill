// client/src/components/ModelControlPanel.tsx
import React, { useState } from 'react';
import { Slider, Button, Card, CardHeader, CardContent } from '../components/ui';
import { RefreshCw, Settings2 } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import ApiService from '../services/api';
import { ModelSettings } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
// import { Settings } from 'lucide-react';

interface ModelControlPanelProps {
  onSettingsChange?: (settings: ModelSettings) => void;
}

const ModelControlPanel: React.FC<ModelControlPanelProps> = ({ onSettingsChange }) => {
  // State
  const [settings, setSettings] = useState<ModelSettings>({
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop_sequences: []
  });

  // Async actions
  const { 
    execute: updateSettings,
    isLoading: isUpdating,
    error: updateError
  } = useAsyncAction(ApiService.updateModelSettings);

  const {
    execute: getStatus,
    isLoading: isLoadingStatus,
    error: statusError
  } = useAsyncAction(ApiService.getModelStatus);

  // Handle settings change
  const handleSettingChange = (key: keyof ModelSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  // Save settings
  const handleSave = async () => {
    const result = await updateSettings(settings);
    if (result && onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  // Refresh status
  const handleRefresh = () => {
    getStatus();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Model Control Panel
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingStatus}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Status Section */}
        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Status</h4>
          {isLoadingStatus ? (
            <LoadingSpinner />
          ) : statusError ? (
            <ErrorMessage message="Failed to load model status" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-gray-400">Model:</span>
                <span className="ml-2 text-white">DarkIdol-Llama-3_1</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Status:</span>
                <span className="ml-2 text-green-400">Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Temperature
            </label>
            <Slider
                value={[settings.temperature]}
                onValueChange={(values: number[]) => {
                    const [value] = values;
                    handleSettingChange('temperature', value);
                }}
                min={0}
                max={1}
                step={0.1}
                disabled={isUpdating}
                />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Max Tokens
            </label>
            <Slider
              value={[settings.max_tokens]}
              onValueChange={(values: number[]) => {
                const [value] = values;
                handleSettingChange('max_tokens', value);
              }}
              min={64}
              max={2048}
              step={64}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Top P
            </label>
            <Slider
              value={[settings.top_p]}
              onValueChange={(values: number[]) => {
                const [value] = values;
                handleSettingChange('top_p', value);
              }}
              min={0}
              max={1}
              step={0.1}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Frequency Penalty
            </label>
            <Slider
              value={[settings.frequency_penalty]}
              onValueChange={(values: number[]) => {
                const [value] = values;
                handleSettingChange('frequency_penalty', value);
              }}
              min={-2}
              max={2}
              step={0.1}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Presence Penalty
            </label>
            <Slider
              value={[settings.presence_penalty]}
              onValueChange={(values: number[]) => {
                const [value] = values;
                handleSettingChange('presence_penalty', value);
              }}
              min={-2}
              max={2}
              step={0.1}
              disabled={isUpdating}
            />
          </div>

          {updateError && (
            <ErrorMessage message="Failed to update settings" />
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <LoadingSpinner />
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelControlPanel;