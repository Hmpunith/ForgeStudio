
import React from 'react';
import { ResourceMetrics } from '../types';

interface StatusBarProps {
  metrics: ResourceMetrics;
  selectedModel?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ metrics, selectedModel = 'qwen2.5-coder:3b' }) => {
  const getColorForValue = (value: number, max: number = 100) => {
    const percent = (value / max) * 100;
    if (percent < 50) return 'text-success';
    if (percent < 80) return 'text-warning';
    return 'text-danger';
  };

  // Format model name for display
  const formatModelName = (model: string) => {
    if (model.includes('deepseek')) return 'DeepSeek 6.7B';
    if (model.includes('qwen2.5-coder:3b')) return 'Qwen 2.5 3B';
    if (model.includes('qwen2.5-coder:1.5b')) return 'Qwen 2.5 1.5B';
    if (model.includes('qwen3-coder:30b')) return 'Qwen3 Coder 30B';
    if (model.includes('qwen3:8b')) return 'Qwen3 8B';
    return model;
  };

  return (
    <footer className="h-7 border-t border-border bg-surface flex items-center justify-between px-3 text-[10px] font-medium text-slate-500 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 group cursor-default">
          <span className={`material-icons-round text-[10px] ${metrics.gpuAvailable ? 'text-success' : 'text-warning'} group-hover:scale-110 transition-transform`}>
            {metrics.gpuAvailable ? 'cloud_done' : 'cloud_off'}
          </span>
          <span>{metrics.gpuAvailable ? 'GPU Active' : 'CPU Only'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="font-bold">CPU</span>
            <span className={getColorForValue(metrics.cpu)}>{Math.round(metrics.cpu)}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold">GPU</span>
            <span className={getColorForValue(metrics.gpu)}>{Math.round(metrics.gpu)}%</span>
          </div>
          {metrics.gpuTemp !== undefined && (
            <div className="flex items-center space-x-1">
              <span className="material-icons-round text-[10px]">thermostat</span>
              <span className={getColorForValue(metrics.gpuTemp, 90)}>{Math.round(metrics.gpuTemp)}°C</span>
            </div>
          )}
          {metrics.gpuPower !== undefined && (
            <div className="flex items-center space-x-1">
              <span className="material-icons-round text-[10px]">bolt</span>
              <span className="text-slate-400">{Math.round(metrics.gpuPower)}W</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <span className="font-bold">VRAM</span>
            <span className={getColorForValue(metrics.vramUsed, metrics.vramTotal)}>
              {metrics.vramUsed.toFixed(1)}/{metrics.vramTotal.toFixed(1)}GB
            </span>
          </div>
          {metrics.ramUsed !== undefined && metrics.ramTotal !== undefined && (
            <div className="flex items-center space-x-1">
              <span className="font-bold">RAM</span>
              <span className="text-slate-400">
                {metrics.ramUsed.toFixed(1)}/{metrics.ramTotal.toFixed(1)}GB
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="material-icons-round text-[10px] text-primary">memory</span>
          <span>{formatModelName(selectedModel)}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
          <span className="font-bold">Local AI</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
