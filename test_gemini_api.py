"""
Quick test script for Gemini API
"""
import google.generativeai as genai

# Your API key
API_KEY = "AIzaSyBBjqR3hi7B93D7eqKIOk6FjSYrOjcU4fU"

try:
    print("🧪 Testing Gemini API...")
    print(f"API Key: {API_KEY[:20]}...")
    
    # Configure
    genai.configure(api_key=API_KEY)
    
    # Create model
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Test prompt
    print("\n📤 Sending test prompt...")
    response = model.generate_content("Create a simple HTML button with Tailwind CSS that says 'Click Me'")
    
    print("\n✅ SUCCESS!")
    print(f"Response: {response.text}")
    print("\n🎉 Gemini API is working correctly!")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
