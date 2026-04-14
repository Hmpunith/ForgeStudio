
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ChatMode, TokenUsage } from '../types';

interface UploadedDoc {
  filename: string;
  text: string;
  truncated: boolean;
}

interface ChatPanelProps {
  history: ChatMessage[];
  onSend: (prompt: string) => void;
  isGenerating: boolean;
  mode: ChatMode;
  tokenUsage: TokenUsage;
  showModeToggle?: boolean;
}

const BACKEND_URL = 'http://localhost:8000';

// Minimal markdown renderer: bold, code, inline code, line breaks
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, li) => {
    // Code block fence (simple)
    if (line.startsWith('```')) {
      nodes.push(<span key={`fence-${li}`} />);
      return;
    }
    // Heading
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#{1,3}\s/, '').trim();
      nodes.push(
        <p key={li} className="font-bold text-slate-100 mt-2 mb-1">{content}</p>
      );
      return;
    }
    // Bullet
    if (/^[-*]\s/.test(line)) {
      const content = renderInline(line.slice(2));
      nodes.push(
        <div key={li} className="flex gap-2 ml-2">
          <span className="text-primary mt-0.5">•</span>
          <span>{content}</span>
        </div>
      );
      return;
    }
    // Normal line
    nodes.push(
      <span key={li}>
        {renderInline(line)}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Split on inline code (`...`) and bold (**...**)
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded text-[11px] font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  history,
  onSend,
  isGenerating,
  mode,
  tokenUsage,
  showModeToggle = false,
}) => {
  const [input, setInput] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0); // tracks nested enter/leave events
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !uploadedDoc) return;
    if (isGenerating) return;

    let finalPrompt = input.trim();

    if (uploadedDoc) {
      const docContext = `[Document: ${uploadedDoc.filename}${uploadedDoc.truncated ? ' (truncated)' : ''}]\n\n${uploadedDoc.text}\n\n---\n\n`;
      finalPrompt = docContext + (finalPrompt || 'Please analyze this document and summarize the key points.');
    }

    onSend(finalPrompt);
    setInput('');
    setUploadedDoc(null);
    setUploadError(null);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadedDoc(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setUploadedDoc({ filename: data.filename, text: data.text, truncated: data.truncated });
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Format timestamp
  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const grouped: { label: string; messages: ChatMessage[] }[] = [];
  history.forEach((msg) => {
    const label = formatDate(msg.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      grouped.push({ label, messages: [msg] });
    }
  });

  // ── CHAT MODE ──────────────────────────────────────────────────────────────
  if (mode === 'chat') {
    return (
      <div
        className="flex-1 flex flex-col bg-background relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* ── Full-window drop overlay ── */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-indigo-400/70 bg-indigo-950/60 backdrop-blur-sm transition-all" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center animate-bounce">
                <span className="material-icons-round text-4xl text-indigo-300">upload_file</span>
              </div>
              <p className="text-lg font-semibold text-indigo-200">Drop to upload</p>
              <p className="text-xs text-indigo-400/80">PDF · DOCX · TXT · CSV · MD</p>
            </div>
          </div>
        )}
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                <span className="material-icons-round text-3xl text-white">chat</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-slate-200">How can I help you today?</h2>
              <p className="text-sm text-slate-500 mb-6">Ask me anything or upload a document to analyze.</p>
              <div className="flex gap-2 text-xs text-slate-600">
                <span className="px-2 py-1 rounded border border-border">📄 PDF</span>
                <span className="px-2 py-1 rounded border border-border">📝 DOCX</span>
                <span className="px-2 py-1 rounded border border-border">📃 TXT</span>
                <span className="px-2 py-1 rounded border border-border">📊 CSV</span>
              </div>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.label}>
              {/* Date separator */}
              <div className="flex items-center gap-3 px-6 py-3">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {group.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border-b border-border/20 ${msg.role === 'assistant' ? 'bg-surface/20' : ''}`}
                >
                  <div className="max-w-3xl mx-auto px-4 py-5 flex gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                      }`}
                    >
                      <span className="material-icons-round text-sm">
                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">
                          {msg.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="text-[10px] text-slate-600">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed">
                        {msg.role === 'assistant' && msg.content !== 'Thinking...'
                          ? renderMarkdown(msg.content)
                          : msg.content === 'Thinking...'
                          ? (
                            <span className="flex items-center gap-2 text-slate-500">
                              <span className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                  />
                                ))}
                              </span>
                              Thinking…
                            </span>
                          )
                          : msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border/50 bg-surface/50 backdrop-blur-sm">
          {/* Document badge */}
          {uploadedDoc && (
            <div className="max-w-3xl mx-auto px-4 pt-3">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-2 text-xs">
                <span className="material-icons-round text-indigo-400 text-sm">description</span>
                <span className="text-indigo-300 flex-1 truncate">{uploadedDoc.filename}</span>
                {uploadedDoc.truncated && (
                  <span className="text-amber-400/80 text-[10px]">truncated</span>
                )}
                <button
                  onClick={() => setUploadedDoc(null)}
                  className="text-slate-600 hover:text-slate-300 transition-colors ml-1"
                >
                  <span className="material-icons-round text-sm">close</span>
                </button>
              </div>
            </div>
          )}
          {uploadError && (
            <div className="max-w-3xl mx-auto px-4 pt-2">
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                ⚠ {uploadError}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-2 bg-background border border-border rounded-2xl px-4 py-3 focus-within:border-slate-600 transition-all">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isGenerating}
                  title="Upload PDF, DOCX, TXT, or CSV"
                  className="shrink-0 text-slate-600 hover:text-indigo-400 disabled:opacity-40 transition-colors mb-0.5"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                  ) : (
                    <span className="material-icons-round text-xl">attach_file</span>
                  )}
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={uploadedDoc ? 'Ask a question about the document…' : 'Message Assistant…'}
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none custom-scrollbar min-h-[24px]"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                  disabled={isGenerating}
                  rows={1}
                />

                <button
                  type="submit"
                  disabled={(!input.trim() && !uploadedDoc) || isGenerating}
                  className={`shrink-0 p-1.5 rounded-lg transition-all mb-0.5 ${
                    (input.trim() || uploadedDoc) && !isGenerating
                      ? 'text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg active:scale-95'
                      : 'text-slate-700 bg-slate-800'
                  }`}
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-icons-round text-[18px]">arrow_upward</span>
                  )}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-center text-slate-700 mt-2">
              Shift+Enter for new line · Drag & drop files to upload
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          className="hidden"
          onChange={handleFilePick}
        />
      </div>
    );
  }

  // ── CODE MODE ──────────────────────────────────────────────────────────────
  return (
    <aside
      className="w-[400px] border-r border-border bg-surface flex flex-col relative z-20 shadow-2xl transition-all duration-300"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Drop overlay for code mode */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-2 rounded-xl border-2 border-dashed border-indigo-400/70 bg-indigo-950/70 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <span className="material-icons-round text-4xl text-indigo-300 animate-bounce">upload_file</span>
            <p className="text-sm font-semibold text-indigo-200">Drop to upload</p>
            <p className="text-xs text-indigo-400/70">PDF · DOCX · TXT · CSV</p>
          </div>
        </div>
      )}

      <div className="border-b border-border bg-background/50 backdrop-blur-md">
        <div className="h-12 flex items-center px-4 justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Conversation</span>
        </div>
      </div>


      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-32">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <span className="material-icons-round text-5xl mb-4 text-indigo-400">code</span>
            <p className="text-sm">Start a conversation to build your application.</p>
            <p className="text-xs mt-2 text-slate-600">Or upload a file to analyze it.</p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[9px] font-medium text-slate-700 uppercase tracking-widest">{group.label}</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {group.messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-slate-800/60 text-slate-200 border border-border/50'
                  }`}
                >
                  {msg.role === 'assistant' && msg.content !== 'Thinking...'
                    ? <div className="leading-relaxed">{renderMarkdown(msg.content)}</div>
                    : msg.content}
                </div>

                {msg.role === 'assistant' && msg.steps && (
                  <div className="mt-2 ml-2 space-y-1.5 w-full">
                    {msg.steps.map((step) => (
                      <div key={step.id} className="flex items-start space-x-2">
                        <div className={`mt-0.5 shrink-0 ${
                          step.status === 'done' ? 'text-emerald-500' :
                          step.status === 'loading' ? 'text-indigo-400 animate-pulse' : 'text-slate-700'
                        }`}>
                          <span className="material-icons-round text-[13px]">
                            {step.status === 'done' ? 'check_circle' :
                             step.status === 'loading' ? 'pending' : 'radio_button_unchecked'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-[11px] font-semibold ${step.status === 'pending' ? 'text-slate-700' : 'text-slate-300'}`}>
                            {step.message}
                          </p>
                          {step.status === 'loading' && step.detail && (
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate italic">{step.detail}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-700 mt-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Code mode input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface via-surface to-transparent">
        {uploadedDoc && (
          <div className="mb-2 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs">
            <span className="material-icons-round text-indigo-400 text-sm">description</span>
            <span className="text-indigo-300 flex-1 truncate">{uploadedDoc.filename}</span>
            <button onClick={() => setUploadedDoc(null)} className="text-slate-600 hover:text-slate-300">
              <span className="material-icons-round text-sm">close</span>
            </button>
          </div>
        )}
        {uploadError && (
          <div className="mb-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
            ⚠ {uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isGenerating}
            title="Upload document"
            className="absolute left-3 bottom-3 text-slate-600 hover:text-indigo-400 disabled:opacity-40 transition-colors z-10"
          >
            {isUploading
              ? <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
              : <span className="material-icons-round text-lg">attach_file</span>}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
            }}
            placeholder="Type your instruction..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-12 py-3 text-sm focus:border-slate-600 resize-none custom-scrollbar transition-all min-h-[50px] max-h-[150px] outline-none"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !uploadedDoc) || isGenerating}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
              (input.trim() || uploadedDoc) && !isGenerating
                ? 'text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg active:scale-95'
                : 'text-slate-700'
            }`}
          >
            {isGenerating
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <span className="material-icons-round text-lg">send</span>}
          </button>
        </form>
        <p className="text-[9px] text-center text-slate-600 mt-1 uppercase tracking-widest">
          Press Enter to send
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.csv"
        className="hidden"
        onChange={handleFilePick}
      />
    </aside>
  );
};

export default ChatPanel;
