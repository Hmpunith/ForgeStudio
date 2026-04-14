import React from 'react';
import { APIConfig, TokenUsage } from '../types';

interface APISettingsProps {
  apiConfig: APIConfig;
  onAPIConfigChange: (config: APIConfig) => void;
  tokenUsage: TokenUsage;
  onTokenLimitChange: (limit: number) => void;
}

const APISettings: React.FC<APISettingsProps> = ({
  apiConfig,
  onAPIConfigChange,
  tokenUsage,
  onTokenLimitChange
}) => {
  return (
    <>
      <section>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">API Configuration</h3>
        
        <div className="space-y-4">
          <div className="bg-background/50 border border-border rounded-xl p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={apiConfig.enabled}
                onChange={(e) => onAPIConfigChange({...apiConfig, enabled: e.target.checked})}
                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Enable API Integration</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Use external APIs for improved code quality (replaces local model when enabled)
                </p>
              </div>
            </label>
          </div>

          {apiConfig.enabled && (
            <>
              <div className="bg-background/50 border border-border rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-200 mb-3">API Provider</h4>
                <select
                  value={apiConfig.provider}
                  onChange={(e) => onAPIConfigChange({...apiConfig, provider: e.target.value as any})}
                  className="w-full bg-surface border border-border rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-primary py-2 px-3"
                >
                  <option value="local">Local Only (Ollama)</option>
                  <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                  <option value="gemini">Google Gemini (FREE tier!)</option>
                  <option value="nvidia">NVIDIA (Free credits)</option>
                </select>
              </div>

              {apiConfig.provider !== 'local' && (
                <>
                  <div className="bg-background/50 border border-border rounded-xl p-4">
                    <h4 className="text-sm font-bold text-slate-200 mb-3">API Key</h4>
                    <input
                      type="password"
                      value={apiConfig.apiKey || ''}
                      onChange={(e) => onAPIConfigChange({...apiConfig, apiKey: e.target.value})}
                      placeholder="Enter your API key..."
                      className="w-full bg-surface border border-border rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-primary py-2 px-3"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                      Get your API key from:{' '}
                      {apiConfig.provider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary hover:underline">OpenAI Platform</a>}
                      {apiConfig.provider === 'anthropic' && <a href="https://console.anthropic.com/" target="_blank" className="text-primary hover:underline">Anthropic Console</a>}
                      {apiConfig.provider === 'gemini' && <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a>}
                      {apiConfig.provider === 'nvidia' && <a href="https://build.nvidia.com/" target="_blank" className="text-primary hover:underline">NVIDIA Build</a>}
                    </p>
                  </div>

                  <div className="bg-background/50 border border-border rounded-xl p-4">
                    <h4 className="text-sm font-bold text-slate-200 mb-3">Model Selection</h4>
                    <select
                      value={apiConfig.model || ''}
                      onChange={(e) => onAPIConfigChange({...apiConfig, model: e.target.value})}
                      className="w-full bg-surface border border-border rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-primary py-2 px-3"
                    >
                      {apiConfig.provider === 'openai' && (
                        <>
                          <option value="gpt-4o-mini">GPT-4o Mini (Fast, $0.15/1M tokens)</option>
                          <option value="gpt-4o">GPT-4o (Best, $2.50/1M tokens)</option>
                        </>
                      )}
                      {apiConfig.provider === 'anthropic' && (
                        <>
                          <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast, $0.80/1M)</option>
                          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Best, $3.00/1M)</option>
                        </>
                      )}
                      {apiConfig.provider === 'gemini' && (
                        <>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash (FREE! Latest)</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro (FREE! Best)</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash (FREE!)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro ($1.25/1M)</option>
                        </>
                      )}
                      {apiConfig.provider === 'nvidia' && (
                        <option value="nvidia/llama-3.1-nemotron-70b-instruct">Nemotron 70B (Free credits)</option>
                      )}
                    </select>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Token Usage & Budget</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-background/50 border border-border rounded-xl p-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Used</span>
            <div className="text-2xl font-bold mt-1">{tokenUsage.used.toLocaleString()}</div>
          </div>
          <div className="bg-background/50 border border-border rounded-xl p-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Limit</span>
            <div className="text-2xl font-bold mt-1">{tokenUsage.limit.toLocaleString()}</div>
          </div>
          <div className="bg-background/50 border border-border rounded-xl p-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cost</span>
            <div className="text-2xl font-bold mt-1">${tokenUsage.cost.toFixed(4)}</div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-200 mb-3">Token Limit</h4>
          <input
            type="number"
            value={tokenUsage.limit}
            onChange={(e) => onTokenLimitChange(parseInt(e.target.value) || 1000000)}
            className="w-full bg-surface border border-border rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-primary py-2 px-3"
            min="10000"
            step="10000"
          />
          <p className="text-[10px] text-slate-500 mt-2">
            Set a budget limit to prevent unexpected costs
          </p>
        </div>

        {tokenUsage.used / tokenUsage.limit > 0.8 && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start space-x-3">
            <span className="material-icons-round text-warning text-lg">warning</span>
            <div>
              <h4 className="text-sm font-bold text-warning mb-1">Approaching Token Limit</h4>
              <p className="text-[11px] text-slate-400">
                You've used {((tokenUsage.used / tokenUsage.limit) * 100).toFixed(1)}% of your token budget.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default APISettings;
