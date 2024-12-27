# AI Study Buddy

AI Study Buddy is a Flask-based web application that helps you study and learn more effectively using Google's Generative AI.

## Prerequisites

- Python 3.7 or higher
- A Google API key for accessing Google's Generative AI services

## Installation

1. Clone the repository:
```bash
git clone https://github.com/msafeerhassan/aistudybuddy.git
cd ai-study-buddy
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install the required dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory and add your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to `http://localhost:5000`

3. Use the interface to:
   - Ask questions and get AI-powered responses
   - Study more effectively with AI assistance
   - Get explanations and examples for complex topics

## Project Structure

- `app.py`: Main Flask application file
- `requirements.txt`: Project dependencies
- `static/`: Static files (CSS, JavaScript)
- `templates/`: HTML templates
- `.env`: Environment variables (API keys)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.
