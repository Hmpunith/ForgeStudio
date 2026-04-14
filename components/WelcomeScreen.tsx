
import React, { useState } from 'react';
import { ChatMode } from '../types';
import ModeToggle from './ModeToggle';
import { ForgeLogo } from './Header';

interface WelcomeScreenProps {
  onStart: (prompt: string) => void;
  isGenerating: boolean;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isGenerating, mode, onModeChange }) => {
  const [input, setInput] = useState('');

  const templates = [
    { title: 'SaaS Dashboard', icon: 'dashboard', prompt: 'Build a modern SaaS dashboard with a sidebar, statistics cards, and a data table using React and Tailwind.' },
    { title: 'Landing Page', icon: 'rocket', prompt: 'Create a high-converting landing page for a tech startup with a hero section, features grid, and pricing table.' },
    { title: 'Portfolio Site', icon: 'person', prompt: 'Design a professional portfolio website for a developer with a project gallery, skills section, and contact form.' },
    { title: 'E-commerce UI', icon: 'shopping_cart', prompt: 'Build a product listing page with filters, search, and a shopping cart sidebar.' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onStart(input);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-3xl z-10 text-center space-y-12">
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
          {/* Logo — same as header */}
          <div className="flex justify-center mb-2">
            <div style={{ filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.5))' }}>
              <ForgeLogo size="lg" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">
            {mode === 'chat' ? (
              <>Ask me <span style={{ color: '#a78bfa' }}>anything</span></>
            ) : (
              <>What do you want to <span style={{ color: '#a78bfa' }}>build?</span></>
            )}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {mode === 'chat'
              ? 'Get help with programming, debugging, concepts, or any coding questions.'
              : 'Describe your application in plain English, and Forge Studio will handle the code, styling, and deployment.'}
          </p>
        </div>

        <div className="flex justify-center mb-6 animate-in slide-in-from-bottom-5 duration-700 delay-50">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>

        <form onSubmit={handleSubmit} className="relative group animate-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={mode === 'chat' 
                ? 'e.g. How do I center a div with flexbox?'
                : 'e.g. Build a CRM dashboard for a real estate company...'}
              className="w-full bg-surface border border-border rounded-2xl px-6 py-5 pr-20 text-lg focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none custom-scrollbar transition-all min-h-[100px] shadow-2xl placeholder:text-slate-600"
              disabled={isGenerating}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={`absolute right-4 bottom-4 px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                !input.trim() || isGenerating 
                ? 'bg-slate-800 text-slate-500' 
                : mode === 'chat'
                ? 'bg-success text-white hover:bg-success/90 shadow-xl shadow-success/30 active:scale-95'
                : 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/30 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'chat' ? 'Ask' : 'Create'}</span>
                  <span className="material-icons-round text-base">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {mode === 'code' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            {templates.map((template) => (
              <button
                key={template.title}
                onClick={() => onStart(template.prompt)}
                className="group p-4 bg-surface/40 border border-border hover:border-primary/50 hover:bg-surface rounded-2xl transition-all text-left space-y-3"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors text-xl">
                    {template.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">{template.title}</h3>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                    Start with a pre-configured {template.title.toLowerCase()} layout.
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 text-[11px] text-slate-600 font-medium uppercase tracking-[0.2em]">
        Forge Studio • Powered by Local AI • v1.0.0
      </div>
    </div>
  );
};

export default WelcomeScreen;
