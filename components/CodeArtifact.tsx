import React, { useState } from 'react';

interface CodeArtifactProps {
  code: string;
  onClose: () => void;
}

const CodeArtifact: React.FC<CodeArtifactProps> = ({ code, onClose }) => {
  // Detect if it's HTML (for preview) or other code (code view only)
  const isHTML = code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<body');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>(isHTML ? 'preview' : 'code');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 border-l border-border bg-surface flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border bg-background/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
            <span className="material-icons-round text-success text-sm">check_circle</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Code Artifact</h3>
            <p className="text-xs text-slate-500">{isHTML ? 'Interactive preview' : 'Code snippet'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs bg-background hover:bg-slate-700 border border-border rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <span className="material-icons-round text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-icons-round text-sm">close</span>
          </button>
        </div>
      </div>
      
      {/* Tabs - only show if HTML */}
      {isHTML && (
        <div className="border-b border-border bg-background/30">
          <div className="flex px-6">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'preview' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="material-icons-round text-sm mr-1.5 align-middle">visibility</span>
              Preview
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'code' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="material-icons-round text-sm mr-1.5 align-middle">code</span>
              Code
            </button>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isHTML && activeTab === 'preview' ? (
          <iframe
            srcDoc={code}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Code Preview"
          />
        ) : (
          <div className="w-full h-full overflow-auto bg-[#1e1e1e] p-6">
            <pre className="text-xs text-slate-300 font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeArtifact;
