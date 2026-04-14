import React from 'react';
import { TokenUsage } from '../types';

interface TokenMonitorProps {
  usage: TokenUsage;
}

const TokenMonitor: React.FC<TokenMonitorProps> = ({ usage }) => {
  const percentage = (usage.used / usage.limit) * 100;
  const remaining = usage.limit - usage.used;
  
  const getColor = () => {
    if (percentage < 50) return 'text-success';
    if (percentage < 80) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="material-icons-round text-primary text-sm">token</span>
          <span className="text-xs font-bold text-slate-300">API Tokens</span>
        </div>
        <span className={`text-xs font-bold ${getColor()}`}>
          {remaining.toLocaleString()} left
        </span>
      </div>
      
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-300 ${
            percentage < 50 ? 'bg-success' : percentage < 80 ? 'bg-warning' : 'bg-danger'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>{usage.used.toLocaleString()} / {usage.limit.toLocaleString()} tokens</span>
        <span>${usage.cost.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default TokenMonitor;
