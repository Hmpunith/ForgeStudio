
import React, { useEffect, useState } from 'react';
import { ResourceMetrics, EngineLog, APIConfig, TokenUsage } from '../types';
import APISettings from './APISettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  metrics: ResourceMetrics;
  logs: EngineLog[];
  apiConfig: APIConfig;
  onAPIConfigChange: (config: APIConfig) => void;
  tokenUsage: TokenUsage;
  onTokenLimitChange: (limit: number) => void;
}

interface OllamaModel {
  name: string;
  size: number;
  modified: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedModel, 
  onModelChange,
  metrics,
  logs,
  apiConfig,
  onAPIConfigChange,
  tokenUsage,
  onTokenLimitChange
}) => {
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [activeTab, setActiveTab] = useState<'models' | 'api'>('models');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableModels();
    }
  }, [isOpen]);

  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch('http://localhost:8000/models');
      const data = await response.json();
      setAvailableModels(data.models || []);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50">
          <div className="flex items-center space-x-2">
            <span className="material-icons-round text-slate-400">settings</span>
            <h2 className="font-bold text-lg">System Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-48 border-r border-border bg-background/30 p-4 space-y-1 shrink-0">
            <button 
              onClick={() => setActiveTab('models')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'models' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              Local Models
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'api' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              API Integration
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            {activeTab === 'models' ? (
              <>
                <section>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Inference Configuration</h3>
              <div className="space-y-4">
                <div className="bg-background/50 border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Active Local Model</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Choose the Ollama model for code generation.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {loadingModels && (
                      <span className="text-xs text-slate-500">Loading...</span>
                    )}
                    <select 
                      value={selectedModel}
                      onChange={(e) => onModelChange(e.target.value)}
                      className="bg-surface border border-border rounded-lg text-xs font-bold text-slate-300 focus:ring-1 focus:ring-primary py-2 pl-3 pr-8"
                      disabled={loadingModels}
                    >
                      {availableModels.length > 0 ? (
                        availableModels.map((model) => (
                          <option key={model.name} value={model.name}>
                            {model.name} ({model.size.toFixed(1)}GB)
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="qwen2.5-coder:3b">Qwen 2.5 Coder 3B</option>
                          <option value="deepseek-coder:6.7b-instruct">DeepSeek Coder 6.7B</option>
                          <option value="qwen2.5-coder:1.5b">Qwen 2.5 Coder 1.5B</option>
                          <option value="qwen3:8b">Qwen3 8B</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="material-icons-round text-blue-400 text-lg">info</span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-300 mb-1">Model Recommendations</h4>
                      <ul className="text-[11px] text-slate-400 space-y-1">
                        <li>• <span className="text-blue-300 font-semibold">Smaller models (1.5B-3B)</span>: Faster, good for simple apps (3-8s)</li>
                        <li>• <span className="text-blue-300 font-semibold">Medium models (6-8B)</span>: Better quality, slower (10-20s)</li>
                        <li>• <span className="text-blue-300 font-semibold">DeepSeek Coder</span>: Best for code quality and formatting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Local Engine Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background/50 border border-border rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU</span>
                  <div className="text-2xl font-bold mt-1">{Math.round(metrics.cpu)}%</div>
                  <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${metrics.cpu}%` }}></div>
                  </div>
                </div>
                <div className="bg-background/50 border border-border rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency</span>
                  <div className="text-2xl font-bold mt-1">{metrics.latency}ms</div>
                  <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="bg-background/50 border border-border rounded-xl p-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Throughput</span>
                  <div className="text-2xl font-bold mt-1">{metrics.throughput} tok/s</div>
                  <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: `${(metrics.throughput / 30) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Internal Engine Logs</h3>
                <span className="text-[10px] font-bold text-success uppercase tracking-widest animate-pulse">Running</span>
              </div>
              <div className="bg-background border border-border rounded-xl p-4 font-mono text-[10px] h-40 overflow-y-auto custom-scrollbar space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="flex space-x-2">
                    <span className="text-slate-600">{log.timestamp}</span>
                    <span className={`font-bold ${log.level === 'WARN' ? 'text-warning' : 'text-primary'}`}>{log.level}</span>
                    <span className="text-slate-400">{log.message}</span>
                  </div>
                ))}
              </div>
            </section>
              </>
            ) : (
              <APISettings
                apiConfig={apiConfig}
                onAPIConfigChange={onAPIConfigChange}
                tokenUsage={tokenUsage}
                onTokenLimitChange={onTokenLimitChange}
              />
            )}
          </div>
        </div>

        <div className="h-14 border-t border-border bg-background/50 flex items-center justify-end px-6 space-x-3">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">Cancel</button>
          <button onClick={onClose} className="px-5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 uppercase tracking-wider">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
