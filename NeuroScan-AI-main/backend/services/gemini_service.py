from google import genai
from config import Config

client = genai.Client(api_key=Config.GEMINI_API_KEY)

def generate_report(prediction: str, confidence: float, all_probabilities: dict) -> str:
    prob_lines = "\n".join(
        f"  - {label}: {prob:.2%}" for label, prob in all_probabilities.items()
    )

    prompt = f"""
You are a medical AI assistant specialized in neuroradiology. Based on the following brain MRI scan analysis results, generate a concise, professional medical report.

**Scan Analysis Results:**
- Primary Finding: {prediction}
- Confidence: {confidence:.2%}
- Class Probabilities:
{prob_lines}

**Instructions:**
- Write in formal medical report style.
- Sections: Summary, Findings, Interpretation, Recommendation.
- If "No Tumor": reassure but suggest follow-up.
- If "Tumor": stress urgency for specialist consultation.
- If "Unsupported Image": note scan quality issue.
- Under 300 words. No patient personal data.
"""

    response = client.models.generate_content(
        model=Config.GEMINI_MODEL_ID,
        contents=prompt
    )
    return response.text