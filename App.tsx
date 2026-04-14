
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ProjectFile, 
  ChatMessage,
  EngineLog, 
  ResourceMetrics,
  ChatMode,
  APIConfig,
  TokenUsage
} from './types';
import Header from './components/Header';
import BuilderWorkspace from './components/BuilderWorkspace';
import ChatPanel from './components/ChatPanel';
import StatusBar from './components/StatusBar';
import SettingsModal from './components/SettingsModal';
import WelcomeScreen from './components/WelcomeScreen';
import CodeArtifact from './components/CodeArtifact';
import { generateIterativeCode } from './services/ollamaService';
import { sendChatMessage, generateWithAPI, chatWithAPI } from './services/chatService';

const INITIAL_FILES: ProjectFile[] = [
  { id: 'src', name: 'src', type: 'folder' },
  { id: 'index.html', name: 'index.html', type: 'file', language: 'html', isOpen: true },
  { id: 'components', name: 'components', type: 'folder', parentId: 'src' },
];

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>('index.html');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState('qwen2.5-coder:7b');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // New features with persistence
  const [chatMode, setChatMode] = useState<ChatMode>('code');
  const [apiConfig, setAPIConfig] = useState<APIConfig>({
    provider: 'local',
    enabled: false
  });
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({
    used: 0,
    limit: 1000000,
    cost: 0
  });
  
  // Load saved data on mount
  useEffect(() => {
    try {
      const savedApiConfig = localStorage.getItem('apiConfig');
      const savedChatHistory = localStorage.getItem('chatHistory');
      const savedTokenUsage = localStorage.getItem('tokenUsage');
      
      if (savedApiConfig) {
        setAPIConfig(JSON.parse(savedApiConfig));
      }
      if (savedChatHistory) {
        const parsed = JSON.parse(savedChatHistory);
        // Convert timestamp strings back to Date objects
        const history = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setChatHistory(history);
        // Always start on the home/welcome screen — don't restore workspace state
        setHasStarted(false);
      }
      if (savedTokenUsage) {
        setTokenUsage(JSON.parse(savedTokenUsage));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);
  
  // Save API config whenever it changes
  useEffect(() => {
    localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);
  
  // Save chat history whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);
  
  // Save token usage whenever it changes
  useEffect(() => {
    localStorage.setItem('tokenUsage', JSON.stringify(tokenUsage));
  }, [tokenUsage]);
  
  // Handle mode change with conversation reset
  const handleModeChange = useCallback((newMode: ChatMode) => {
    setChatMode(newMode);
    setChatHistory([]); // Clear conversation when switching modes
    setPreviewContent(''); // Clear preview in code mode
    localStorage.removeItem('chatHistory'); // Clear saved history
  }, []);
  
  const handleClearHistory = useCallback(() => {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      setChatHistory([]);
      setPreviewContent('');
      localStorage.removeItem('chatHistory');
      setHasStarted(false);
    }
  }, []);
  
  const [logs, setLogs] = useState<EngineLog[]>([]);
  const [metrics, setMetrics] = useState<ResourceMetrics>({
    cpu: 0, gpu: 0, vramUsed: 0, vramTotal: 6.0, throughput: 0, latency: 0
  });

  // Fetch real metrics — tries dedicated port 8001 first, falls back to port 8000
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isActive = true;
    let usePort = 8001; // Start with metrics server

    const tryFetch = async (port: number) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`http://localhost:${port}/metrics`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    };

    const fetchMetrics = async () => {
      if (!isActive) return;
      try {
        let data: any;
        try {
          data = await tryFetch(usePort);
        } catch {
          // Flip port and retry once
          const fallback = usePort === 8001 ? 8000 : 8001;
          data = await tryFetch(fallback);
          usePort = fallback; // stick to working port
        }

        if (isActive) {
          setMetrics({
            cpu:        data.cpu        ?? 0,
            gpu:        data.gpu_percent ?? 0,
            vramUsed:   data.vram_used  ?? 0,
            vramTotal:  data.vram_total ?? 0,
            throughput: 0,
            latency:    0,
            gpuTemp:    data.gpu_temp   ?? 0,
            gpuPower:   data.gpu_power  ?? 0,
            ramUsed:    data.ram_used   ?? 0,
            ramTotal:   data.ram_total  ?? 16,
            gpuAvailable: data.gpu_available ?? false,
          });
        }
      } catch {
        // Silently ignore — metrics will stay at last known values
      }
    };

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, 2000);

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);


  const handleGenerate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    // Switch to workspace view if not already there
    if (!hasStarted) setHasStarted(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      mode: chatMode
    };

    const assistantMsgId = (Date.now() + 1).toString();
    
    // Different handling for chat vs code mode
    if (chatMode === 'chat') {
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date(),
        mode: 'chat'
      };

      setChatHistory(prev => [...prev, userMsg, assistantMsg]);
      setIsGenerating(true);

      try {
        let response = '';
        
        // Use API if enabled for better quality
        if (apiConfig.enabled && apiConfig.apiKey && apiConfig.provider !== 'local') {
          const result = await chatWithAPI(
            prompt,
            apiConfig.provider as 'openai' | 'anthropic' | 'gemini' | 'nvidia',
            apiConfig.apiKey,
            apiConfig.model
          );
          response = result.response;
          
          setTokenUsage(prev => ({
            ...prev,
            used: prev.used + result.tokens,
            cost: prev.cost + result.cost
          }));
        } else {
          // Use local model
          response = await sendChatMessage(prompt, selectedModel, chatHistory);
        }
        
        // Check if response contains code blocks for artifact display
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const codeMatches = [...response.matchAll(codeBlockRegex)];
        
        console.log('Chat mode - Code blocks found:', codeMatches.length);
        
        if (codeMatches.length > 0) {
          // Get the first code block
          const codeLanguage = codeMatches[0][1] || 'text';
          const extractedCode = codeMatches[0][2];
          
          console.log('Code language:', codeLanguage);
          console.log('Code preview:', extractedCode.substring(0, 100));
          
          // Show code artifact for any code (Python, HTML, JavaScript, etc.)
          if (extractedCode && extractedCode.trim().length > 0) {
            setPreviewContent(extractedCode);
            console.log('✅ Code artifact set!');
          }
        }
        
        setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
          ...m,
          content: response
        } : m));

      } catch (err: any) {
        console.error(err);
        const msg = err?.message || '';
        let errText = 'Backend is not running. Please restart the app.';
        if (msg.includes('model') || msg.includes('404')) {
          errText = `Model not found. Open Settings and pick an available model.`;
        } else if (msg.includes('timeout') || msg.includes('Timeout')) {
          errText = 'Request timed out. The model may be too slow — try a smaller one.';
        } else if (msg.includes('API error')) {
          errText = msg;
        } else if (msg) {
          errText = `Error: ${msg}`;
        }
        setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
          ...m,
          content: `⚠️ ${errText}`
        } : m));
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Code generation mode
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      mode: 'code',
      isCode: true,
      steps: [
        { id: '1', status: 'loading', message: 'Analyzing request...', detail: prompt },
        { id: '2', status: 'pending', message: 'Generating code...' },
        { id: '3', status: 'pending', message: 'Building preview...' }
      ]
    };

    setChatHistory(prev => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);

    try {
      await new Promise(r => setTimeout(r, 800));
      setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        steps: m.steps?.map(s => s.id === '1' ? { ...s, status: 'done' } : s.id === '2' ? { ...s, status: 'loading' } : s)
      } : m));

      let updatedCode = '';
      let usedAPI = false;
      
      // Use API if enabled and configured (PRIMARY, not fallback)
      if (apiConfig.enabled && apiConfig.apiKey && apiConfig.provider !== 'local') {
        const result = await generateWithAPI(
          prompt,
          apiConfig.provider as 'openai' | 'anthropic' | 'gemini' | 'nvidia',
          apiConfig.apiKey,
          apiConfig.model
        );
        updatedCode = result.response;
        usedAPI = true;
        
        // Update token usage
        setTokenUsage(prev => ({
          ...prev,
          used: prev.used + result.tokens,
          cost: prev.cost + result.cost
        }));
      } else {
        // Use local model only if API not enabled
        updatedCode = await generateIterativeCode(prompt, previewContent, selectedModel);
      }
      
      setPreviewContent(updatedCode);

      setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        steps: m.steps?.map(s => s.id === '2' ? { ...s, status: 'done' } : s.id === '3' ? { ...s, status: 'loading' } : s)
      } : m));

      await new Promise(r => setTimeout(r, 600));

      setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: usedAPI 
          ? `Generated using ${apiConfig.provider} API for improved quality. You can refine it by asking for specific changes.`
          : 'I\'ve generated the code. You can refine it by asking for specific changes.',
        steps: m.steps?.map(s => ({ ...s, status: 'done' }))
      } : m));

    } catch (err: any) {
      console.error('Code generation error:', err);
      const msg = err?.message || 'Sorry, I encountered an error. Please try again.';
      setChatHistory(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: `⚠️ Error: ${msg}`,
        steps: m.steps?.map(step => 
          step.status === 'loading' ? { ...step, status: 'error' } : step
        )
      } : m));
    } finally {
      setIsGenerating(false);
    }
  }, [previewContent, selectedModel, hasStarted, chatMode, chatHistory, apiConfig, tokenUsage]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-slate-200 font-sans">
      <Header 
        activeProject={hasStarted ? "My New Project" : "Welcome"} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={() => {
          setHasStarted(false);
          setChatHistory([]);
          setPreviewContent('');
          localStorage.removeItem('chatHistory');
        }}
        onClearHistory={hasStarted ? handleClearHistory : undefined}
      />
      
      <main className="flex-1 flex overflow-hidden relative">
        {!hasStarted ? (
          <WelcomeScreen 
            onStart={handleGenerate} 
            isGenerating={isGenerating}
            mode={chatMode}
            onModeChange={handleModeChange}
          />
        ) : (
          <div className="flex-1 flex overflow-hidden transition-all duration-300 ease-in-out">
            {chatMode === 'chat' ? (
              // Chat mode: Conversation with code artifact when code is shared
              <>
                <ChatPanel 
                  history={chatHistory} 
                  onSend={handleGenerate} 
                  isGenerating={isGenerating}
                  mode={chatMode}
                  tokenUsage={tokenUsage}
                />
                {previewContent && (
                  <CodeArtifact 
                    code={previewContent}
                    onClose={() => setPreviewContent('')}
                  />
                )}
              </>
            ) : (
              // Code mode: split view with preview
              <>
                <ChatPanel 
                  history={chatHistory} 
                  onSend={handleGenerate} 
                  isGenerating={isGenerating}
                  mode={chatMode}
                  tokenUsage={tokenUsage}
                />
                <BuilderWorkspace 
                  previewContent={previewContent} 
                  isGenerating={isGenerating} 
                  files={files}
                  selectedFileId={selectedFileId}
                  onSelectFile={setSelectedFileId}
                />
              </>
            )}
          </div>
        )}
      </main>

      <StatusBar metrics={metrics} selectedModel={selectedModel} />

      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          metrics={metrics}
          logs={logs}
          apiConfig={apiConfig}
          onAPIConfigChange={setAPIConfig}
          tokenUsage={tokenUsage}
          onTokenLimitChange={(limit) => setTokenUsage({...tokenUsage, limit})}
        />
      )}
    </div>
  );
};

export default App;
