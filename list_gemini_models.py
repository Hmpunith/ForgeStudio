"""
List available Gemini models
"""
import google.generativeai as genai

API_KEY = "AIzaSyBBjqR3hi7B93D7eqKIOk6FjSYrOjcU4fU"

try:
    genai.configure(api_key=API_KEY)
    
    print("📋 Available Gemini Models:\n")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✅ {model.name}")
            print(f"   Display: {model.display_name}")
            print()
            
except Exception as e:
    print(f"❌ Error: {e}")
