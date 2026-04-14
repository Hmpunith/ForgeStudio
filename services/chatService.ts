const BACKEND_URL = 'http://localhost:8000';

export const sendChatMessage = async (
  message: string,
  model: string,
  history: any[]
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model,
        history: history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'No response';
    
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const chatWithAPI = async (
  message: string,
  provider: 'openai' | 'anthropic' | 'gemini' | 'nvidia',
  apiKey: string,
  model?: string
): Promise<{ response: string; tokens: number; cost: number }> => {
  // Use dedicated chat endpoint for normal conversation
  try {
    const response = await fetch(`${BACKEND_URL}/api-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        provider,
        api_key: apiKey,
        model
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      response: data.response || '',
      tokens: data.tokens || 0,
      cost: data.cost || 0
    };
    
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};

export const generateWithAPI = async (
  prompt: string,
  provider: 'openai' | 'anthropic' | 'gemini' | 'nvidia',
  apiKey: string,
  model?: string
): Promise<{ response: string; tokens: number; cost: number }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        provider,
        api_key: apiKey,
        model
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      response: data.response || '',
      tokens: data.tokens || 0,
      cost: data.cost || 0
    };
    
  } catch (error) {
    console.error("API Generation Error:", error);
    throw error;
  }
};
