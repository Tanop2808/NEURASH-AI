from flask import Blueprint, request, jsonify
import jwt
from config import Config
from services.gemini_service import generate_report
from services.webhook_service import send_report_via_webhook
from functools import wraps

report_bp = Blueprint('report', __name__)

# --- JWT Auth Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
           jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


@report_bp.route('/report', methods=['POST'])
@token_required
def generate_and_send_report():
    """
    Expects JSON body from a previous /predict call:
    {
        "prediction": "Tumor",
        "confidence": 0.93,
        "all_probabilities": {"No Tumor": 0.05, "Tumor": 0.93, "Unsupported Image": 0.02}
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    prediction = data.get('prediction')
    confidence = data.get('confidence')
    all_probabilities = data.get('all_probabilities')
    email = data.get('email')

    if not all([prediction, confidence is not None, all_probabilities]):
        return jsonify({"error": "Missing fields: prediction, confidence, all_probabilities"}), 400

    # Step 1: Generate report via Gemini
    try:
        report = generate_report(prediction, confidence, all_probabilities)
    except Exception as e:
        return jsonify({"error": f"Gemini report generation failed: {str(e)}"}), 500

    return jsonify({
        "report": report
    }), 200

@report_bp.route('/send-email', methods=['POST'])
@token_required
def send_email():
    prediction = request.form.get('prediction')
    confidence_str = request.form.get('confidence')
    report = request.form.get('report')
    email = request.form.get('email')
    
    if not all([prediction, confidence_str, report]):
        return jsonify({"error": "Missing required text fields"}), 400
        
    try:
        confidence = float(confidence_str)
    except ValueError:
        return jsonify({"error": "Invalid confidence format"}), 400

    pdf_file = None
    if 'pdf' in request.files:
        pdf_file = request.files['pdf'].read()

    try:
        webhook_result = send_report_via_webhook(report, prediction, confidence, email, pdf_file)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    return jsonify(webhook_result), 200