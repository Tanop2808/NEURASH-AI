from flask import Blueprint, request, jsonify
from google import genai
from config import Config
import jwt

chat_bp = Blueprint('chat', __name__)

client = genai.Client(api_key=Config.GEMINI_API_KEY)

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat():
    data = request.get_json()
    messages = data.get('messages', [])
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
        history = []
        for msg in messages[:-1]:
            history.append({
                "role": msg["role"],
                "parts": [{"text": msg["content"]}]
            })

        last_message = messages[-1]["content"]

        system = """You are NeuroScan AI Assistant, a helpful medical AI specialized in neuroradiology and brain MRI analysis. You help users understand:
- Brain MRI scan results and what they mean
- Medical terminology related to neurology
- What different tumor types are
- General brain health questions
- How AI assists in medical diagnosis
Always remind users that your responses are for educational purposes only and not a substitute for professional medical advice. Be concise, clear, and empathetic."""

        response = client.models.generate_content(
            model=Config.GEMINI_MODEL_ID,
            contents=last_message,
            config={"system_instruction": system}
        )

        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500