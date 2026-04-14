
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { ProjectFile } from '../types';

interface BuilderWorkspaceProps {
  previewContent: string;
  isGenerating: boolean;
  files: ProjectFile[];
  selectedFileId: string;
  onSelectFile: (id: string) => void;
}

const BuilderWorkspace: React.FC<BuilderWorkspaceProps> = ({ 
  previewContent, 
  isGenerating,
  files,
  selectedFileId,
  onSelectFile
}) => {
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

  const defaultContent = `
    <!DOCTYPE html>
    <html class="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>body { background: #0a0c10; color: #f0f6fc; font-family: 'Inter', sans-serif; }</style>
      </head>
      <body class="p-20 flex flex-col items-center justify-center h-screen text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
          <span class="material-icons-round text-primary text-3xl">auto_awesome</span>
        </div>
        <h1 class="text-3xl font-black mb-2 tracking-tight">Enter prompt to start</h1>
        <p class="text-slate-500 max-w-sm mx-auto">Your application will render here in real-time as you chat with the AI.</p>
      </body>
    </html>
  `;

  return (
    <section className="flex-1 flex flex-col relative bg-[#0a0c10]">
      {/* Workspace Toolbar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface z-10">
        <div className="flex bg-background p-1 rounded-lg border border-border/50">
          <button 
            onClick={() => setView('code')} 
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center space-x-2 ${view === 'code' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="material-icons-round text-xs">code</span>
            <span>Code</span>
          </button>
          <button 
            onClick={() => setView('preview')} 
            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center space-x-2 ${view === 'preview' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="material-icons-round text-xs">visibility</span>
            <span>Preview</span>
          </button>
        </div>

        {view === 'preview' && (
          <div className="flex items-center space-x-1 border border-border rounded-lg p-0.5 bg-background">
            <button onClick={() => setDevice('mobile')} className={`p-1 rounded transition-colors ${device === 'mobile' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
              <span className="material-icons-round text-base">smartphone</span>
            </button>
            <button onClick={() => setDevice('desktop')} className={`p-1 rounded transition-colors ${device === 'desktop' ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300'}`}>
              <span className="material-icons-round text-base">desktop_windows</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {view === 'code' ? (
          <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            {/* Sidebar only shown in Code view */}
            <Sidebar 
              files={files} 
              selectedId={selectedFileId} 
              onSelect={onSelectFile} 
            />
            <div className="flex-1 p-6 h-full bg-[#0d1117] overflow-auto custom-scrollbar">
              <div className="flex items-center space-x-2 mb-4 opacity-50 px-2 border-b border-border pb-2">
                <span className="material-icons-round text-sm">javascript</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{selectedFileId}</span>
              </div>
              <pre className="font-code text-[12px] leading-relaxed text-blue-300/90 selection:bg-primary/30">
                {previewContent || "// Use the chat to generate some code first."}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-6 flex justify-center relative animate-in fade-in duration-300">
            <div className={`transition-all duration-500 ease-in-out bg-white rounded-xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-border flex flex-col overflow-hidden ${
              device === 'mobile' ? 'max-w-[390px] h-[844px]' : 'w-full h-full'
            }`}>
              {/* Browser chrome */}
              <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3 space-x-2 shrink-0">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 bg-white rounded-md px-2 py-0.5 text-[9px] text-slate-400 border border-slate-200 flex items-center font-medium mx-6">
                  <span className="material-icons-round text-[10px] mr-1 text-slate-300">lock</span>
                  app-preview.localhost
                </div>
              </div>

              <div className="flex-1 relative bg-slate-50">
                {isGenerating && (
                  <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
                <iframe 
                  srcDoc={previewContent || defaultContent}
                  className="w-full h-full border-none"
                  title="Application Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BuilderWorkspace;
