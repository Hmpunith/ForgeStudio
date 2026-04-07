
import React from 'react';

interface HeaderProps {
  activeProject: string;
  onOpenSettings: () => void;
  onReset: () => void;
  onClearHistory?: () => void;
}

// Shared Forge Studio logo — same as welcome screen
export const ForgeLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  const icon = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl';
  const radius = size === 'lg' ? 'rounded-2xl' : 'rounded-xl';
  return (
    <div
      className={`${dim} ${radius} flex items-center justify-center flex-shrink-0`}
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)',
        boxShadow: '0 0 20px rgba(99,102,241,0.35)',
      }}
    >
      {/* Custom SVG layers / forge icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${icon}`}
        style={{ width: size === 'lg' ? 28 : size === 'sm' ? 16 : 20, height: size === 'lg' ? 28 : size === 'sm' ? 16 : 20 }}
      >
        <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" fillOpacity="0.95" />
        <path d="M2 13l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
        <path d="M2 18l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" />
      </svg>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ activeProject, onOpenSettings, onReset, onClearHistory }) => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface z-30 shadow-md">
      <div className="flex items-center space-x-4">
        <div
          onClick={onReset}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="group-hover:scale-105 transition-transform">
            <ForgeLogo size="sm" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Forge<span style={{ color: '#a78bfa' }}>Studio</span>
          </span>
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <span className="text-slate-100 font-medium">{activeProject}</span>
          <span className="material-icons-round text-xs opacity-50 cursor-pointer hover:text-white transition-colors">edit</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {onClearHistory && (
          <button
            onClick={onClearHistory}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all flex items-center space-x-2"
            title="Clear chat history"
          >
            <span className="material-icons-round text-sm">delete_sweep</span>
            <span className="text-xs font-bold uppercase tracking-wider">Clear</span>
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all flex items-center space-x-2"
        >
          <span className="material-icons-round text-sm">settings</span>
          <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
        </button>
        <div className="h-6 w-px bg-border mx-1" />
        <button className="flex items-center space-x-2 px-3 py-1.5 border border-border hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium">
          <span className="material-icons-round text-sm">share</span>
          <span>Share</span>
        </button>
        <button
          className="flex items-center space-x-2 px-4 py-1.5 text-white rounded-lg transition-all text-sm font-bold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}
        >
          <span className="material-icons-round text-sm">rocket_launch</span>
          <span>Deploy</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
