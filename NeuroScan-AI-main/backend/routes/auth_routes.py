from flask import Blueprint, request, jsonify
import jwt
import datetime
from config import Config

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), 400

    if data["username"] != Config.VALID_USERNAME or data["password"] != Config.VALID_PASSWORD:
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "sub": data["username"],
            "iat": datetime.datetime.utcnow(),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        Config.SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token, "message": "Login successful"}), 200