import React from 'react';
import { ChatMode } from '../types';

interface ModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-surface border border-border rounded-lg p-1">
      <button
        onClick={() => onModeChange('code')}
        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
          mode === 'code'
            ? 'bg-primary text-white shadow-lg'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="material-icons-round text-sm">code</span>
        <span>Code Mode</span>
      </button>
      <button
        onClick={() => onModeChange('chat')}
        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
          mode === 'chat'
            ? 'bg-success text-white shadow-lg'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="material-icons-round text-sm">chat</span>
        <span>Chat Mode</span>
      </button>
    </div>
  );
};

export default ModeToggle;
