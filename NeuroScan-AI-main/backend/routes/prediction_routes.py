from flask import Blueprint, request, jsonify
from services.prediction_service import predict

prediction_bp = Blueprint("prediction", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route("/predict", methods=["POST"])
def run_prediction():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"}), 415

    try:
        result = predict(file.read())
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500