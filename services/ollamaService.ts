const BACKEND_URL = 'http://localhost:8000';

export const generateIterativeCode = async (
  prompt: string, 
  currentCode: string, 
  model: string
): Promise<string> => {
  try {
    let systemPrompt = '';
    
    if (!currentCode || currentCode.trim() === '') {
      // Initial generation - optimized prompt
      systemPrompt = `Create a modern HTML app for: ${prompt}

Requirements:
- Complete HTML5 with <!DOCTYPE html>
- Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Material Icons CDN: <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
- Dark theme with modern design
- Clean, well-indented code
- Smooth animations and transitions
- Fully functional JavaScript
- Professional UI with proper spacing

Return only the complete HTML code:`;
    } else {
      // Iterative update - shorter prompt
      systemPrompt = `Update this app: ${prompt}

Current code:
${currentCode}

Return the complete updated HTML:`;
    }

    console.log('🚀 Sending to backend...');

    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: systemPrompt,
        model: model || 'qwen2.5-coder:7b'
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Backend error:', data.error);
      return currentCode || generateErrorHTML(`Backend error: ${data.error}`);
    }
    
    let generatedCode = data.response || '';
    
    console.log('✅ Received response, length:', generatedCode.length);
    
    // Clean up markdown
    generatedCode = generatedCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract HTML if present
    if (generatedCode.includes('<!DOCTYPE html>') || generatedCode.includes('<html')) {
      const htmlStart = generatedCode.indexOf('<!DOCTYPE html>') !== -1 
        ? generatedCode.indexOf('<!DOCTYPE html>')
        : generatedCode.indexOf('<html');
      
      const htmlEnd = generatedCode.lastIndexOf('</html>');
      
      if (htmlStart !== -1 && htmlEnd !== -1) {
        generatedCode = generatedCode.substring(htmlStart, htmlEnd + 7);
      }
      
      console.log('✅ Valid HTML found, length:', generatedCode.length);
      return generatedCode;
    }
    
    console.error('❌ No valid HTML in response');
    return currentCode || generateErrorHTML('No valid HTML generated. Try a simpler prompt.');
    
  } catch (error) {
    console.error("❌ Inference Error:", error);
    return currentCode || generateErrorHTML('Backend connection error. Check if backend is running.');
  }
};

function generateErrorHTML(message: string): string {
  return `<!DOCTYPE html>
<html class="dark">
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
  <style>body { background: #0a0c10; color: #f0f6fc; }</style>
</head>
<body class="p-20 flex items-center justify-center h-screen">
  <div class="text-center max-w-md">
    <span class="material-icons-round text-red-400 text-6xl mb-4">error_outline</span>
    <h1 class="text-2xl font-bold text-red-400 mb-2">Generation Error</h1>
    <p class="text-slate-400">${message}</p>
    <div class="mt-6 p-4 bg-slate-800 rounded-lg text-left text-sm">
      <p class="text-slate-300 mb-2">Troubleshooting:</p>
      <ul class="text-slate-400 space-y-1 text-xs">
        <li>• Check backend is running: <code class="text-blue-400">uvicorn main:app --reload</code></li>
        <li>• Check Ollama is running: <code class="text-blue-400">ollama serve</code></li>
        <li>• Try a simpler prompt</li>
        <li>• Check browser console (F12) for errors</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}
