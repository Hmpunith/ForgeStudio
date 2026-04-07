# New Features Implementation Plan

## 1. Normal Chat Mode ✅
- Toggle between "Code Generation" and "Chat" mode
- Chat mode for questions, explanations, debugging help
- Code mode for building apps (current behavior)

## 2. API Integration (Fallback/Quality Boost) ✅
- Add OpenAI/Anthropic API support
- Use when local model fails or for better quality
- Configurable in settings
- API key management

## 3. Document Reader & Generator ✅
- Upload and read documents (PDF, TXT, MD)
- Generate documentation from code
- Export generated apps as files
- Project documentation generator

## 4. API Token Monitoring ✅
- Track API usage (tokens used)
- Set token limits/budgets
- Show remaining tokens
- Alerts when approaching limit
- Cost estimation

## Implementation Order

### Phase 1: Chat Mode (Quick Win)
- Add mode toggle in UI
- Separate chat endpoint
- Display chat responses differently

### Phase 2: API Integration
- Add API settings
- OpenAI/Anthropic integration
- Fallback logic
- Token counting

### Phase 3: Document Features
- File upload component
- Document parsing
- Export functionality
- Documentation generator

### Phase 4: Token Monitoring
- Usage tracking
- Budget settings
- Dashboard widget
- Alerts

Let's start!
