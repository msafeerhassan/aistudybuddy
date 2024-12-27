from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv
from functools import lru_cache
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_url_path='')

# Configure Google Gemini
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No Google API key found. Please set GOOGLE_API_KEY in .env file")

genai.configure(api_key=GOOGLE_API_KEY)

# Initialize Gemini model with safety settings
model = genai.GenerativeModel('gemini-pro',
    safety_settings=[
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ])

@lru_cache(maxsize=100)
def get_cached_response(prompt):
    """Cache responses to avoid redundant API calls"""
    return model.generate_content(prompt)

def create_study_prompt(user_message):
    """Create a structured prompt for better responses"""
    return f"""You are an AI Study Buddy designed to help students with their study related questions/queries. 
    Follow these guidelines for formatting your response:
    
    1. Use markdown-style formatting:
       - Use ** for bold text (e.g., **important concept**)
       - Use * for italics (e.g., *note*)
       - Use ` for code or mathematical expressions
       - Use bullet points (-) for lists
       - Use numbered lists (1., 2., etc.) for steps or sequences
       - Use # for main headings and ## for subheadings
    
    2. Structure your response:
       - Start with a brief overview/introduction
       - Break down complex concepts into smaller parts
       - Use examples and analogies when helpful
       - End with a summary or key takeaways
    
    3. Make it engaging:
       - Use simple, clear language
       - Provide real-world examples
       - Include relevant analogies
       - Add helpful tips or mnemonics when applicable
    
    Question/Query: {user_message}
    
    Provide a well-structured, formatted response:"""

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering home page: {str(e)}")
        return jsonify({'error': {'message': 'Internal server error'}}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        start_time = datetime.now()
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': {'message': 'No message provided'}}), 400

        # Create structured prompt
        prompt = create_study_prompt(user_message)
        logger.info(f"Processing query: {user_message[:50]}...")

        # Get response (cached if available)
        response = get_cached_response(prompt)
        
        # Format the response
        formatted_response = {
            'candidates': [{
                'content': {
                    'parts': [{
                        'text': response.text
                    }]
                }
            }]
        }

        # Log processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Request processed in {processing_time:.2f} seconds")
        
        return jsonify(formatted_response)

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({'error': {'message': 'An error occurred while processing your request'}}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=True)