import numpy as np
from PIL import Image
import io
import tensorflow as tf
from config import Config

# Load model once at startup
model = tf.keras.models.load_model(Config.MODEL_PATH)

def preprocess_image(file_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(file_bytes)).convert("L")  # ← "L" = grayscale, was "RGB"
    img = img.resize((Config.IMG_SIZE, Config.IMG_SIZE))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=-1)                     # ← ADD: shape (128, 128, 1)
    return np.expand_dims(arr, axis=0)                     # shape (1, 128, 128, 1)

def predict(file_bytes: bytes) -> dict:
    input_arr = preprocess_image(file_bytes)
    preds = model.predict(input_arr)[0]
    class_idx = int(np.argmax(preds))
    confidence = float(np.max(preds))

    return {
        "prediction": Config.CLASS_NAMES[class_idx],
        "confidence": round(confidence * 100, 2),
        "all_probabilities": {
            label: round(float(preds[i]) * 100, 2)
            for i, label in enumerate(Config.CLASS_NAMES)
        }
    }