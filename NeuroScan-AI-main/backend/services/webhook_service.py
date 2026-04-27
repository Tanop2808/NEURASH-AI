import requests
from config import Config

def send_report_via_webhook(report: str, prediction: str, confidence: float, email: str = None, pdf_file=None) -> dict:
    data = {
        "prediction": prediction,
        "confidence": f"{confidence:.2%}",
        "report": report,
        "email": email
    }

    files = None
    if pdf_file:
        files = {'attachment': ('report.pdf', pdf_file, 'application/pdf')}

    response = requests.post(
        Config.N8N_WEBHOOK_URL,
        data=data,
        files=files,
        timeout=10
    )

    if response.status_code in (200, 201):
        return {"success": True, "message": "Report sent via webhook"}
    else:
        return {"success": False, "message": f"Webhook failed: {response.status_code}"}