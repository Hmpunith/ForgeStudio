from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import json
import subprocess
import psutil
import re
import tempfile
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_DIR = os.path.abspath("../generated_projects")

class GenerateRequest(BaseModel):
    prompt: str
    model: str | None = None
    mode: str | None = "code"  # "code" or "chat"


class ChatRequest(BaseModel):
    message: str
    model: str | None = None
    history: list | None = None


class APIRequest(BaseModel):
    prompt: str
    provider: str = "openai"  # "openai" or "anthropic"
    api_key: str
    model: str | None = None


# ===============================
# Generate with Streaming Support
# ===============================
@app.post("/generate")
async def generate(request: GenerateRequest):
    model_name = request.model or "deepseek-coder:6.7b-instruct"

    print(f"\n{'='*60}")
    print(f"🚀 Model: {model_name}")
    print(f"📝 Prompt: {request.prompt[:100]}...")
    print(f"{'='*60}\n")
    
    # Adjust settings based on model size
    is_large_model = any(x in model_name.lower() for x in ["30b", "33b", "34b", "70b"])
    is_medium_model = any(x in model_name.lower() for x in ["7b", "8b", "13b"])
    
    if is_large_model:
        print("⚠️  Large model detected - using optimized settings for CPU/GPU hybrid")
        num_predict = 2000
        timeout_seconds = 300  # 5 minutes
    elif is_medium_model:
        print("📊 Medium model detected - using balanced settings")
        num_predict = 3000
        timeout_seconds = 240  # 4 minutes for 7B-13B models
    else:
        num_predict = 3500
        timeout_seconds = 180
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": request.prompt,
                "stream": False,
                "options": {
                    "num_predict": num_predict,
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "num_gpu": 99,
                    "num_thread": 6 if is_large_model else 4,
                    "use_mmap": True,
                    "use_mlock": False if is_large_model else True,
                    "repeat_penalty": 1.1,
                    "num_ctx": 4096  # Context window
                }
            },
            timeout=timeout_seconds
        )
        
        response.raise_for_status()
        raw_output = response.json().get("response", "")

        print(f"\n{'='*60}")
        print("📥 RAW OUTPUT (first 300 chars):")
        print(f"{'='*60}")
        print(raw_output[:300] + "..." if len(raw_output) > 300 else raw_output)
        print(f"{'='*60}\n")

        # Clean up the output
        cleaned_output = raw_output.strip()
        
        # Remove markdown code blocks
        if "```html" in cleaned_output:
            cleaned_output = cleaned_output.split("```html", 1)[1]
            if "```" in cleaned_output:
                cleaned_output = cleaned_output.split("```", 1)[0]
        elif "```" in cleaned_output:
            parts = cleaned_output.split("```")
            if len(parts) >= 3:
                cleaned_output = parts[1]
        
        cleaned_output = cleaned_output.strip()

        # Extract HTML content
        if "<!DOCTYPE html>" in cleaned_output or "<html" in cleaned_output:
            html_start = cleaned_output.find("<!DOCTYPE html>")
            if html_start == -1:
                html_start = cleaned_output.find("<html")
            
            if html_start != -1:
                # Add </html> if missing
                if "</html>" not in cleaned_output:
                    cleaned_output += "\n</html>"
                
                html_end = cleaned_output.rfind("</html>")
                if html_end != -1:
                    cleaned_output = cleaned_output[html_start:html_end + 7]

        print(f"\n{'='*60}")
        print("✅ CLEANED OUTPUT (first 300 chars):")
        print(f"{'='*60}")
        print(cleaned_output[:300] + "..." if len(cleaned_output) > 300 else cleaned_output)
        print(f"{'='*60}\n")

        return {"response": cleaned_output}
        
    except requests.Timeout:
        print("❌ ERROR: Ollama request timed out")
        return {"response": "", "error": "Request timed out. Model may be too large or slow."}
    except requests.RequestException as e:
        error_msg = str(e)
        print(f"❌ ERROR: Ollama request failed: {error_msg}")
        
        # Check for specific errors
        if "500" in error_msg or "Internal Server Error" in error_msg:
            if "memory" in error_msg.lower() or "system memory" in error_msg.lower():
                return {
                    "response": "", 
                    "error": "Not enough RAM! Model needs 13.6GB but only 12.6GB available. Close other apps or use a smaller model (6.7B or 8B)."
                }
            return {
                "response": "", 
                "error": "Ollama internal error. Model may be too large for your system. Try a smaller model."
            }
        
        return {"response": "", "error": f"Ollama error: {error_msg}"}
    except Exception as e:
        print(f"❌ ERROR: Unexpected error: {e}")
        return {"response": "", "error": str(e)}


# ===============================
# List Files
# ===============================
@app.get("/files")
def list_files():
    file_list = []

    if not os.path.exists(PROJECT_DIR):
        return {"files": []}

    for root, dirs, files in os.walk(PROJECT_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, PROJECT_DIR)

            file_list.append({
                "path": relative_path.replace("\\", "/"),
                "name": file
            })

    return {"files": file_list}


# ===============================
# Get Single File
# ===============================
@app.get("/file")
def get_file(path: str = Query(...)):
    file_path = os.path.join(PROJECT_DIR, path)

    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return {"content": f.read()}

    return {"content": ""}


# ===============================
# System Metrics (Real GPU/CPU stats)
# ===============================
@app.get("/metrics")
def get_metrics():
    try:
        # Get CPU usage
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        # Get RAM usage
        ram = psutil.virtual_memory()
        ram_used_gb = ram.used / (1024**3)
        ram_total_gb = ram.total / (1024**3)
        
        # Try to get GPU stats using nvidia-smi
        gpu_data = {
            "gpu_percent": 0,
            "gpu_temp": 0,
            "gpu_power": 0,
            "vram_used": 0,
            "vram_total": 0,
            "gpu_available": False
        }
        
        try:
            # Run nvidia-smi to get GPU stats
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=utilization.gpu,temperature.gpu,power.draw,memory.used,memory.total', 
                 '--format=csv,noheader,nounits'],
                capture_output=True,
                text=True,
                timeout=2
            )
            
            if result.returncode == 0:
                output = result.stdout.strip()
                print(f"📊 nvidia-smi output: {output}")
                
                # Parse: gpu_util, temp, power, mem_used, mem_total
                parts = [x.strip() for x in output.split(',')]
                
                if len(parts) >= 5:
                    gpu_data = {
                        "gpu_percent": float(parts[0]),
                        "gpu_temp": float(parts[1]),
                        "gpu_power": float(parts[2]),
                        "vram_used": float(parts[3]) / 1024,  # Convert MB to GB
                        "vram_total": float(parts[4]) / 1024,
                        "gpu_available": True
                    }
                    print(f"✅ GPU data parsed: {gpu_data}")
            else:
                print(f"❌ nvidia-smi failed with code {result.returncode}")
                print(f"stderr: {result.stderr}")
        except FileNotFoundError:
            print("❌ nvidia-smi not found in PATH")
        except Exception as e:
            print(f"❌ GPU monitoring error: {e}")
        
        metrics = {
            "cpu": round(cpu_percent, 1),
            "ram_used": round(ram_used_gb, 2),
            "ram_total": round(ram_total_gb, 2),
            **gpu_data
        }
        
        print(f"📤 Returning metrics: {metrics}")
        return metrics
        
    except Exception as e:
        print(f"❌ Metrics error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "cpu": 0,
            "ram_used": 0,
            "ram_total": 16,
            "gpu_percent": 0,
            "gpu_temp": 0,
            "gpu_power": 0,
            "vram_used": 0,
            "vram_total": 6,
            "gpu_available": False,
            "error": str(e)
        }


# ===============================
# Get Available Ollama Models
# ===============================
@app.get("/models")
def get_available_models():
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = []
            for model in data.get("models", []):
                model_name = model.get("name", "")
                # Filter for coding models
                if any(keyword in model_name.lower() for keyword in ["coder", "code", "qwen", "deepseek"]):
                    models.append({
                        "name": model_name,
                        "size": model.get("size", 0) / (1024**3),  # Convert to GB
                        "modified": model.get("modified_at", "")
                    })
            return {"models": models}
        else:
            return {"models": [], "error": "Ollama not responding"}
    except Exception as e:
        print(f"Error fetching models: {e}")
        return {"models": [], "error": str(e)}


# ===============================
# Chat Mode (Normal Conversation)
# ===============================
@app.post("/chat")
async def chat(request: ChatRequest):
    model_name = request.model or "qwen2.5-coder:7b"
    
    print(f"\n{'='*60}")
    print(f"💬 Chat Mode - Model: {model_name}")
    print(f"📝 Message: {request.message[:100]}...")
    print(f"{'='*60}\n")
    
    try:
        # Build conversation context
        conversation = ""
        if request.history:
            for msg in request.history[-5:]:  # Last 5 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                conversation += f"{role}: {content}\n"
        
        conversation += f"user: {request.message}\nassistant:"
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model_name,
                "prompt": conversation,
                "stream": False,
                "options": {
                    "num_predict": 1000,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_gpu": 99
                }
            },
            timeout=60
        )
        
        response.raise_for_status()
        reply = response.json().get("response", "").strip()
        
        return {"response": reply, "tokens": len(reply.split())}
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return {"response": "Sorry, I encountered an error. Please try again.", "error": str(e)}


# ===============================
# API Integration - Chat Mode (Normal Conversation)
# ===============================
@app.post("/api-chat")
async def api_chat(request: APIRequest):
    print(f"\n{'='*60}")
    print(f"💬 API Chat - Provider: {request.provider}")
    print(f"{'='*60}\n")
    
    try:
        if request.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=request.api_key)
            
            model = request.model or "gpt-4o-mini"
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant. Answer questions clearly and conversationally."},
                    {"role": "user", "content": request.prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                "response": content,
                "tokens": tokens_used,
                "cost": calculate_cost(tokens_used, model, "openai")
            }
            
        elif request.provider == "anthropic":
            from anthropic import Anthropic
            
            client = Anthropic(api_key=request.api_key)
            model = request.model or "claude-3-5-sonnet-20241022"
            
            message = client.messages.create(
                model=model,
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": request.prompt}
                ]
            )
            
            content = message.content[0].text
            tokens_used = message.usage.input_tokens + message.usage.output_tokens
            
            return {
                "response": content,
                "tokens": tokens_used,
                "cost": calculate_cost(tokens_used, model, "anthropic")
            }
            
        elif request.provider == "gemini":
            import google.generativeai as genai
            
            genai.configure(api_key=request.api_key)
            model = genai.GenerativeModel(request.model or 'gemini-2.5-flash')
            
            # Normal chat prompt - NO code generation instructions
            response = model.generate_content(request.prompt)
            content = response.text
            
            # Gemini doesn't provide exact token count, estimate
            tokens_used = len(content.split()) * 1.3
            
            return {
                "response": content,
                "tokens": int(tokens_used),
                "cost": calculate_cost(int(tokens_used), request.model or 'gemini-2.5-flash', "gemini")
            }
            
        elif request.provider == "nvidia":
            from openai import OpenAI
            
            client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=request.api_key
            )
            
            model = request.model or "nvidia/llama-3.1-nemotron-70b-instruct"
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": request.prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else len(content.split()) * 1.3
            
            return {
                "response": content,
                "tokens": int(tokens_used),
                "cost": 0.0
            }
        
        else:
            return {"error": "Unsupported provider"}
            
    except Exception as e:
        print(f"❌ API Chat error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "response": ""}


# ===============================
# API Integration - Code Mode (Code Generation)
# ===============================
@app.post("/api-generate")
async def api_generate(request: APIRequest):
    print(f"\n{'='*60}")
    print(f"🌐 API Generation - Provider: {request.provider}")
    print(f"{'='*60}\n")
    
    try:
        if request.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=request.api_key)
            
            model = request.model or "gpt-4o-mini"
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert frontend developer. Generate clean, modern HTML code with Tailwind CSS."},
                    {"role": "user", "content": request.prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            
            return {
                "response": content,
                "tokens": tokens_used,
                "cost": calculate_cost(tokens_used, model, "openai")
            }
            
        elif request.provider == "anthropic":
            from anthropic import Anthropic
            
            client = Anthropic(api_key=request.api_key)
            model = request.model or "claude-3-5-sonnet-20241022"
            
            message = client.messages.create(
                model=model,
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": request.prompt}
                ]
            )
            
            content = message.content[0].text
            tokens_used = message.usage.input_tokens + message.usage.output_tokens
            
            return {
                "response": content,
                "tokens": tokens_used,
                "cost": calculate_cost(tokens_used, model, "anthropic")
            }
            
        elif request.provider == "gemini":
            import google.generativeai as genai
            
            genai.configure(api_key=request.api_key)
            model = genai.GenerativeModel(request.model or 'gemini-2.5-flash')
            
            # Enhanced prompt for code generation
            enhanced_prompt = f"""You are an expert frontend developer. Generate ONLY complete, working HTML code with Tailwind CSS.

IMPORTANT RULES:
1. Return ONLY the HTML code, nothing else
2. Start with <!DOCTYPE html>
3. Include Tailwind CSS via CDN
4. Make it modern, beautiful, and fully functional
5. Keep code clean and concise - minimal comments
6. NO explanations, NO markdown, NO descriptions - ONLY CODE

User request: {request.prompt}

Generate the complete HTML code now:"""
            
            response = model.generate_content(enhanced_prompt)
            content = response.text
            
            # Clean up any markdown code blocks if present
            if '```html' in content:
                content = content.split('```html')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            # Gemini doesn't provide exact token count, estimate
            tokens_used = len(content.split()) * 1.3
            
            return {
                "response": content,
                "tokens": int(tokens_used),
                "cost": calculate_cost(int(tokens_used), request.model or 'gemini-2.5-flash', "gemini")
            }
            
        elif request.provider == "nvidia":
            from openai import OpenAI
            
            # NVIDIA uses OpenAI-compatible API
            client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=request.api_key
            )
            
            model = request.model or "nvidia/llama-3.1-nemotron-70b-instruct"
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert frontend developer. Generate clean, modern HTML code."},
                    {"role": "user", "content": request.prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else len(content.split()) * 1.3
            
            return {
                "response": content,
                "tokens": int(tokens_used),
                "cost": 0.0  # NVIDIA API is often free/credits-based
            }
        
        else:
            return {"error": "Unsupported provider"}
            
    except Exception as e:
        print(f"❌ API error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "response": ""}


def calculate_cost(tokens: int, model: str, provider: str) -> float:
    """Calculate approximate cost based on tokens"""
    # Pricing per 1M tokens (approximate, as of 2024)
    pricing = {
        "openai": {
            "gpt-4o": 2.50,
            "gpt-4o-mini": 0.15,
            "gpt-4-turbo": 10.00,
            "gpt-3.5-turbo": 0.50
        },
        "anthropic": {
            "claude-3-5-sonnet-20241022": 3.00,
            "claude-3-5-haiku-20241022": 0.80,
            "claude-3-opus-20240229": 15.00
        },
        "gemini": {
            "gemini-2.5-flash": 0.00,  # Free tier
            "gemini-2.5-pro": 0.00,  # Free tier
            "gemini-2.0-flash": 0.00,  # Free tier
            "gemini-1.5-pro": 1.25,
            "gemini-1.5-flash": 0.075
        },
        "nvidia": {
            "default": 0.00  # Often free/credits
        }
    }
    
    rate = pricing.get(provider, {}).get(model, 0.0)
    return (tokens / 1_000_000) * rate

# ===============================
# Document / File Upload & Analyze
# ===============================
@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Accept a PDF, DOCX, TXT, or MD file and return its extracted text.
    The frontend can then include that text in a prompt for the AI.
    """
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    allowed = {".pdf", ".docx", ".doc", ".txt", ".md", ".csv"}
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed)}"
        )

    content_bytes = await file.read()
    extracted_text = ""

    try:
        if ext == ".pdf":
            # Use PyMuPDF (fitz) if available, else fallback to pypdf
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(stream=content_bytes, filetype="pdf")
                for page in doc:
                    extracted_text += page.get_text()
                doc.close()
            except ImportError:
                try:
                    from pypdf import PdfReader
                    reader = PdfReader(io.BytesIO(content_bytes))
                    for page in reader.pages:
                        extracted_text += page.extract_text() or ""
                except ImportError:
                    raise HTTPException(
                        status_code=500,
                        detail="PDF support requires 'PyMuPDF' or 'pypdf'. Run: pip install PyMuPDF"
                    )

        elif ext in {".docx", ".doc"}:
            try:
                from docx import Document
                doc = Document(io.BytesIO(content_bytes))
                extracted_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            except ImportError:
                raise HTTPException(
                    status_code=500,
                    detail="DOCX support requires 'python-docx'. Run: pip install python-docx"
                )

        elif ext in {".txt", ".md", ".csv"}:
            extracted_text = content_bytes.decode("utf-8", errors="replace")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    # Trim to avoid overloading context (first ~8000 chars ≈ ~2000 tokens)
    MAX_CHARS = 8000
    truncated = False
    if len(extracted_text) > MAX_CHARS:
        extracted_text = extracted_text[:MAX_CHARS]
        truncated = True

    return {
        "filename": filename,
        "ext": ext,
        "text": extracted_text.strip(),
        "char_count": len(extracted_text),
        "truncated": truncated
    }



# ===============================
# System Info — RAM, VRAM, CPU
# ===============================
@app.get("/system-info")
def get_system_info():
    ram = psutil.virtual_memory()
    ram_total_gb = round(ram.total / (1024**3), 1)
    vram_total_gb = 0.0
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=memory.total', '--format=csv,noheader,nounits'],
            capture_output=True, text=True, timeout=2
        )
        if result.returncode == 0:
            vram_total_gb = round(float(result.stdout.strip().split('\n')[0]) / 1024, 1)
    except Exception:
        pass
    return {
        "ram_gb": ram_total_gb,
        "vram_gb": vram_total_gb,
        "cpu_cores": psutil.cpu_count(logical=False) or psutil.cpu_count(),
        "has_gpu": vram_total_gb > 0
    }


# ===============================
# Pull a model from Ollama — SSE streaming progress
# ===============================
from fastapi.responses import StreamingResponse as _SR

@app.post("/pull-model")
async def pull_model(body: dict):
    model_name = body.get("model", "")
    if not model_name:
        raise HTTPException(status_code=400, detail="model name is required")

    def _gen():
        import json as _j
        try:
            resp = requests.post(
                "http://localhost:11434/api/pull",
                json={"name": model_name, "stream": True},
                stream=True, timeout=600
            )
            for raw in resp.iter_lines():
                if raw:
                    try:
                        yield "data: " + _j.dumps(_j.loads(raw)) + "\n\n"
                    except Exception:
                        pass
            yield 'data: {"status":"done"}\n\n'
        except Exception as exc:
            import json as _je
            yield "data: " + _je.dumps({"status": "error", "error": str(exc)}) + "\n\n"

    return _SR(_gen(), media_type="text/event-stream",
               headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
