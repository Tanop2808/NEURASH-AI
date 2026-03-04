import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "neuroscan-secret-key")

    VALID_USERNAME = os.environ.get("APP_USERNAME", "GreyMatterX")
    VALID_PASSWORD = os.environ.get("APP_PASSWORD", "Neuro@123")

    MODEL_PATH = os.environ.get(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "..", "brain_tumor_model.h5")
    )
    IMG_SIZE = 128
    IMAGE_SIZE = 128

    MAX_CONTENT_LENGTH = 10 * 1024 * 1024

    CLASS_NAMES = ["No Tumor", "Tumor", "Unsupported Image"]

    GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyAfaBYeJc2RF4DyuXVtUWtn_vTpwF4GsZA")  # ← ADD REAL KEY
    GEMINI_MODEL_ID = "gemini-2.5-flash"

    JWT_SECRET = os.environ.get("JWT_SECRET", "neuroscan-jwt-secret")  # ← ADD THIS LINE

    N8N_WEBHOOK_URL = os.environ.get(
        "N8N_WEBHOOK_URL",
        "https://ajayyyy.app.n8n.cloud/webhook/neuroscan-report"
    )