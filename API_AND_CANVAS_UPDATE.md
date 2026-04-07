# API Integration & Code Canvas Update

## What's New

### 1. API as Primary (Not Fallback) ✅
**Before**: API was used as fallback if local model failed
**Now**: When API is enabled, it replaces the local model entirely

#### How It Works
- Enable API in Settings → API Configuration
- Choose provider (OpenAI, Anthropic, Gemini, NVIDIA)
- Add your API key
- Now all generations use the API for better quality
- Local model only used when API is disabled

#### Benefits
- 🎯 Better code quality with GPT-4o or Claude
- 💰 Free options available (Gemini 2.0 Flash)
- 🚀 Faster responses with optimized models
- 📊 Token tracking and cost monitoring

### 2. Code Canvas in Chat Mode ✅
**Like ChatGPT's Artifacts**: Code appears in a live preview panel

#### How It Works
1. Switch to Chat mode on welcome screen
2. Ask for code: "Create a landing page with hero section"
3. AI responds with explanation
4. If response contains HTML/web code, it automatically appears in preview panel
5. Preview shows live rendered code
6. Close preview with X button

#### Features
- Automatic code detection from chat responses
- Live preview of HTML/CSS/JavaScript
- Side-by-side chat and preview
- Works with both local and API models
- Clean, ChatGPT-style interface

## Usage Examples

### Example 1: Using API for Better Quality
```
1. Open Settings
2. Enable API Integration
3. Select "Google Gemini (FREE tier!)"
4. Get API key from https://aistudio.google.com/apikey
5. Paste key and save
6. Now all code generation uses Gemini for better results
```

### Example 2: Chat Mode with Code Canvas
```
User: "Create a modern portfolio landing page with a gradient background"

AI: "I'll create a modern portfolio landing page for you..."
[Code automatically appears in preview panel →]

User: "Make the gradient purple to blue"

AI: "I've updated the gradient..."
[Preview updates with new code →]
```

## API Providers

### Free Options
- **Gemini 2.0 Flash** - Completely FREE, great quality
- **NVIDIA Nemotron** - Free credits available

### Paid Options (Better Quality)
- **GPT-4o Mini** - $0.15 per 1M tokens (fast, cheap)
- **GPT-4o** - $2.50 per 1M tokens (best quality)
- **Claude 3.5 Haiku** - $0.80 per 1M tokens (fast)
- **Claude 3.5 Sonnet** - $3.00 per 1M tokens (excellent)

## Code Canvas Features

### Automatic Detection
- Detects HTML code blocks in responses
- Looks for complete web pages
- Extracts and renders automatically

### Preview Panel
- Live rendering of HTML/CSS/JS
- Sandboxed for security
- Resizable layout
- Close button to hide

### Works In
- ✅ Chat mode (primary use case)
- ✅ With local models
- ✅ With API models
- ✅ Both simple and complex code

## Technical Details

### API Integration Flow
```
User sends prompt
    ↓
Check if API enabled
    ↓
Yes → Use API (OpenAI/Anthropic/Gemini/NVIDIA)
    ↓
No → Use local Ollama model
    ↓
Return response
```

### Code Canvas Flow
```
Chat response received
    ↓
Scan for code blocks (```html, ```javascript, etc.)
    ↓
Found HTML/web code?
    ↓
Yes → Extract and set preview content
    ↓
Preview panel appears automatically
```

## Configuration

### Enable API
```typescript
// In Settings Modal → API Configuration
{
  enabled: true,
  provider: 'gemini',  // or 'openai', 'anthropic', 'nvidia'
  apiKey: 'your-key-here',
  model: 'gemini-2.0-flash-exp'
}
```

### Token Limits
- Set budget limits to prevent overspending
- Monitor usage in real-time
- Warning at 80% usage
- Cost tracking per request

## Benefits Summary

### API Integration
- ✅ Better code quality
- ✅ Faster responses
- ✅ Free options available
- ✅ Multiple providers
- ✅ Token tracking
- ✅ Cost monitoring

### Code Canvas
- ✅ ChatGPT-like experience
- ✅ Automatic code preview
- ✅ Live rendering
- ✅ Clean interface
- ✅ Works with all models
- ✅ Easy to use

## Comparison

### Before
- API was fallback only
- Chat mode was text-only
- No code preview in chat
- Had to switch to code mode

### After
- API is primary when enabled
- Chat mode has code canvas
- Automatic code detection
- Preview appears automatically
- Better quality with APIs
- More like ChatGPT experience

## Tips

### For Best Quality
1. Enable API integration
2. Use GPT-4o or Claude 3.5 Sonnet
3. Set reasonable token limits
4. Monitor costs

### For Free Usage
1. Use Gemini 2.0 Flash (completely free)
2. Or use local Ollama models
3. NVIDIA offers free credits

### For Chat Mode
1. Ask conversational questions
2. Request code when needed
3. Preview appears automatically
4. Iterate with follow-up questions

## Files Modified

- `App.tsx` - API primary logic, code canvas layout
- `types.ts` - Added hasCode flag, updated APIConfig
- `services/chatService.ts` - Support all providers
- `components/APISettings.tsx` - Updated description
- `components/ChatPanel.tsx` - Already ChatGPT-style

## Next Steps

1. Test API integration with Gemini (free)
2. Try chat mode with code requests
3. See code canvas in action
4. Monitor token usage
5. Adjust settings as needed

---

**Everything is ready!** Enable API in settings and try chat mode with code requests to see the canvas in action.
