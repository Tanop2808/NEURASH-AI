import requests
from config import Config

def send_report_via_webhook(report: str, prediction: str, confidence: float) -> dict:
    payload = {
        "prediction": prediction,
        "confidence": f"{confidence:.2%}",
        "report": report
    }

    response = requests.post(
        Config.N8N_WEBHOOK_URL,
        json=payload,
        timeout=10
    )

    if response.status_code in (200, 201):
        return {"success": True, "message": "Report sent via webhook"}
    else:
        return {"success": False, "message": f"Webhook failed: {response.status_code}"}