import os
import streamlit as st
import numpy as np
import cv2
from keras.models import load_model
from PIL import Image
from streamlit_lottie import st_lottie
import requests
import plotly.graph_objects as go
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image as RLImage,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from io import BytesIO
import re
import base64
import google.generativeai as genai


# --- Page config (must be before any UI) ---
st.set_page_config(
    page_title="NeuroScan AI",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        "About": "🧠 AI-powered Brain Tumor Detection App built with Streamlit",
        "Report a bug": "mailto:support@example.com",
        "Get help": "https://yourdomain.com/privacy",
    },
)

# --- Session state defaults ---
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "system",
            "content": (
                "You are a highly knowledgeable and professional AI assistant specialized in neuroscience. "
                "Your role is to provide clear, accurate, and easy-to-understand explanations about brain "
                "anatomy, brain tumors, MRI interpretations, neurological diseases, treatments, and recent "
                "neuroscience research. Always use evidence-based information, avoid speculation, and politely "
                "remind users that you are not a substitute for professional medical advice. Tailor your responses "
                "to be informative for both medical professionals and curious learners. If the question is unclear "
                "or outside neuroscience, ask for clarification or gently guide the user back to relevant topics."
            ),
        }
    ]

if "patient_info_filled" not in st.session_state:
    st.session_state.patient_info_filled = False
    st.session_state.patient_data = {}


def login_ui():
    """
    Compact, sleek login UI - removes the large top spacing so the small top header and
    the login card sit closer together.
    """
    st.markdown(
        """
        <style>
        /* ------------------------------
           TOP BAR (compact)
           ------------------------------ */
        .ns-topbar {
            display:flex;
            align-items:center;
            gap:12px;
            padding:8px 12px;
            width:100%;
            box-sizing:border-box;
            background: linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));
            border-bottom: 1px solid rgba(255,255,255,0.02);
            position: sticky;
            top: 0;
            z-index: 999;
        }
        .ns-logo {
            width:40px;
            height:40px;
            border-radius:8px;
            background: linear-gradient(135deg,#7c3aed,#06b6d4);
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
            font-size:20px;
            box-shadow: 0 6px 20px rgba(124,58,237,0.10);
        }
        .ns-title {
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            color: #e6eef8;
            font-weight: 800;
            font-size: 16px;
            margin: 0;
            line-height:1;
        }
        .ns-sub {
            color:#9fb3dd;
            font-size:11px;
            margin:0;
            opacity:0.95;
        }

        /* ------------------------------
           PAGE container
           ------------------------------ */
        .ns-page {
            background: linear-gradient(180deg,#071226 0%, #0c1b2b 100%);
            min-height: auto;
            padding: 10px 12px;
            box-sizing: border-box;
        }

        /* ------------------------------
           Centered card
           ------------------------------ */
        .ns-card {
            width:420px;
            max-width:96%;
            margin: 10px auto;
            background: rgba(255,255,255,0.025);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 28px rgba(2,6,23,0.55);
            border: 1px solid rgba(255,255,255,0.025);
            color: #e6eef8;
            font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto;
        }

        .ns-heading {
            font-size:18px;
            font-weight:800;
            margin: 0 0 6px 0;
            color: #ffffff;
        }
        .ns-lead {
            font-size:13px;
            color:#9fb3dd;
            margin:0 0 12px 0;
        }

        /* Labels */
        .ns-label {
            display:block;
            color:#d8e3f0 !important;
            font-weight:700 !important;
            font-size:13px !important;
            margin-bottom:6px;
        }

        /* Inputs */
        .ns-input input {
            width:100% !important;
            padding:10px 12px !important;
            font-size:14px !important;
            background: rgba(255,255,255,0.02) !important;
            color: #e8f0ff !important;
            border: 1px solid rgba(255,255,255,0.05) !important;
            border-radius:8px !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.01);
        }
        .ns-input input:focus {
            outline: none !important;
            border-image-source: linear-gradient(90deg,#7c3aed,#06b6d4);
            border-image-slice: 1;
            box-shadow: 0 6px 20px rgba(99,102,241,0.05) !important;
        }

        /* Primary button */
        .ns-btn {
            width:100%;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            padding:10px 12px;
            border-radius:10px;
            background: linear-gradient(90deg, #7c3aed, #06b6d4);
            color:#fff;
            font-weight:800;
            font-size:14px;
            border:none;
            cursor:pointer;
            box-shadow: 0 10px 30px rgba(7,89,173,0.08);
        }
        .ns-btn:hover { transform: translateY(-1px); box-shadow:0 14px 36px rgba(7,89,173,0.12); }

        .ns-row {
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-top:8px;
            margin-bottom:10px;
            color:#9fb3dd;
            font-size:13px;
        }

        .ns-small {
            text-align:center;
            font-size:12px;
            color:#8fa6cd;
            margin-top:6px;
        }

        @media (max-width:480px) {
            .ns-card { padding:14px; margin: 12px auto; }
            .ns-logo { width:36px; height:36px; font-size:18px; }
            .ns-title { font-size:15px; }
        }
        </style>

        <!-- Top compact header -->
        <div class="ns-topbar" role="banner" aria-label="NeuroScan top bar">
            <div class="ns-logo" aria-hidden="true">🧠</div>
            <div>
                <p class="ns-title">NeuroScan AI</p>
                <p class="ns-sub">Secure sign in to continue</p>
            </div>
        </div>

        <!-- Page container -->
        <div class="ns-page">
            <div class="ns-card" role="region" aria-label="Login card">
                <h3 class="ns-heading">Welcome back</h3>
                <p class="ns-lead">Sign in with your account to access NeuroScan AI</p>
        """,
        unsafe_allow_html=True,
    )

    with st.form("login_form_compact", clear_on_submit=False):
        st.markdown(
            '<label class="ns-label" for="username">Username</label>',
            unsafe_allow_html=True,
        )
        username = st.text_input(
            "", key="username", placeholder="Enter the Username", label_visibility="collapsed"
        )

        st.markdown('<div style="height:6px"></div>', unsafe_allow_html=True)

        st.markdown(
            '<label class="ns-label" for="password">Password</label>',
            unsafe_allow_html=True,
        )
        password = st.text_input(
            "",
            type="password",
            key="password",
            placeholder="Enter your password",
            label_visibility="collapsed",
        )

        remember = st.checkbox("Remember me", value=False, key="remember_me")
        st.markdown(
            '<div class="ns-row"><div></div><div><a href="#" style="color:#9fb3dd;text-decoration:none;font-weight:700;">Forgot?</a></div></div>',
            unsafe_allow_html=True,
        )

        st.markdown(
            """
            <style>
            div[data-testid="stFormSubmitButton"] button {
                width: 100% !important;
                height: 48px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 10px !important;
                background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%) !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                font-size: 16px !important;
                border: 2px solid rgba(255,255,255,0.1) !important;
                cursor: pointer !important;
                box-shadow:
                    0 4px 12px rgba(0,0,0,0.15),
                    0 2px 4px rgba(0,0,0,0.1) !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
                position: relative !important;
                overflow: hidden !important;
                margin-top: 8px !important;
            }
            div[data-testid="stFormSubmitButton"] button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            div[data-testid="stFormSubmitButton"] button:hover {
                background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow:
                    0 8px 20px rgba(0,0,0,0.25),
                    0 4px 8px rgba(0,0,0,0.15) !important;
                border-color: rgba(255,255,255,0.2) !important;
            }
            div[data-testid="stFormSubmitButton"] button:hover::before {
                left: 100%;
            }
            div[data-testid="stFormSubmitButton"] button:active {
                transform: translateY(0) !important;
                box-shadow:
                    0 2px 8px rgba(0,0,0,0.2),
                    0 1px 2px rgba(0,0,0,0.1) !important;
            }
            </style>
            """,
            unsafe_allow_html=True,
        )

        submitted = st.form_submit_button("Sign In")

        st.markdown(
            '<div class="ns-small">Use <strong>GreyMatterX</strong> / <strong>Neuro@123</strong> for demo access</div>',
            unsafe_allow_html=True,
        )

        if submitted:
            if (username or "").strip() == "" or (password or "").strip() == "":
                st.error("Please enter both username and password.")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return False

            if username == "GreyMatterX" and password == "Neuro@123":
                st.session_state.logged_in = True
                st.success("✅ Login successful — redirecting...")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return True
            else:
                st.error("❌ Invalid username or password")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return False

    st.markdown("</div></div>", unsafe_allow_html=True)
    return False


# --- Show login UI and stop if not authenticated ---
if not st.session_state.logged_in:
    logged_in_now = login_ui()
    if not logged_in_now:
        st.stop()

# --- Patient Information Collection ---
if not st.session_state.patient_info_filled:
    st.markdown("---")

    col1, col2 = st.columns([2, 1])
    with col1:
        st.markdown(
            """
            <h2 style='color: #ffffff; font-size: 28px; margin-bottom: 10px;'>
            👤 Patient Information
            </h2>
            <p style='color: #9fb3dd; font-size: 16px;'>
            Please enter patient details before uploading MRI scan
            </p>
            """,
            unsafe_allow_html=True,
        )

    with col2:
        st.markdown('<div style="height: 100px"></div>', unsafe_allow_html=True)

    with st.form("patient_info_form", clear_on_submit=False):
        col1, col2 = st.columns(2)

        with col1:
            patient_name = st.text_input(
                "👤 Patient Name", placeholder="John Doe", key="patient_name"
            )
            patient_age = st.number_input(
                "🎂 Age", min_value=0, max_value=120, value=30, key="patient_age"
            )
            patient_gender = st.selectbox(
                "⚥ Gender", ["Male", "Female", "Other"], key="patient_gender"
            )

        with col2:
            patient_id = st.text_input(
                "🆔 Patient ID", placeholder="PT-12345", key="patient_id"
            )
            patient_email = st.text_input(
                "📧 Email (optional)",
                placeholder="patient@example.com",
                key="patient_email",
            )

        submitted_patient = st.form_submit_button(
            "✅ Save Patient Info & Continue", use_container_width=True
        )

        if submitted_patient:
            if not patient_name.strip() or not patient_id.strip():
                st.error("❌ Please fill Patient Name and Patient ID (required fields).")
            else:
                st.session_state.patient_data = {
                    "name": patient_name.strip(),
                    "id": patient_id.strip(),
                    "age": patient_age,
                    "gender": patient_gender,
                    "email": patient_email.strip() if patient_email else "Not provided",
                }
                st.session_state.patient_info_filled = True
                st.success("✅ Patient information saved!")
                st.rerun()

    st.markdown("---")
    st.stop()

# --- Model loading (cached) ---
@st.cache_resource
def load_tumor_model(model_path: str = "brain_tumor_model.h5"):
    return load_model(model_path)


IMG_SIZE = 128
model = None
try:
    model = load_tumor_model()
except Exception as e:
    st.error(f"Failed to load model: {e}")
    st.stop()


# --- Gemini API config for Neuro Chatbot ---
try:
    from streamlit.errors import StreamlitSecretNotFoundError
except Exception:
    StreamlitSecretNotFoundError = Exception

GEMINI_API_KEY = None
try:
    GEMINI_API_KEY = st.secrets["GOOGLE_API_KEY"]
except (StreamlitSecretNotFoundError, KeyError):
    GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", None)

if not GEMINI_API_KEY:
    st.warning(
        "Gemini API key not found. Chatbot will be disabled. "
        "Set st.secrets['GOOGLE_API_KEY'] or environment variable GOOGLE_API_KEY."
    )
else:
    genai.configure(api_key=GEMINI_API_KEY)

GEMINI_MODEL_ID = "gemini-2.5-flash"


def get_ai_response(messages):
    """Use Google Gemini to answer neuroscience questions."""
    if not GEMINI_API_KEY:
        return "Chatbot is disabled because the Gemini API key is not configured."

    # Convert your message list into a single text prompt
    parts = []
    for m in messages:
        if m["role"] in ("user", "assistant"):
            parts.append(f'{m["role"].upper()}: {m["content"]}')
    prompt = "\n\n".join(parts)

    try:
        model_ = genai.GenerativeModel(GEMINI_MODEL_ID)
        response = model_.generate_content(prompt)
        return response.text or "No response from Gemini."
    except Exception as e:
        return f"Error calling Gemini: {e}"


# --- Email validation function ---
def is_valid_email(email):
    """Validate email format"""
    if email == "Not provided" or not email:
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


# --- Custom CSS (app styling) ---
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
html, body, [class*="css"] {
    font-family: 'Poppins', sans-serif;
}
.main {
    background: linear-gradient(135deg, #141E30 0%, #243B55 100%);
    color: #fff;
}
.glass-card {
    background: rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.37);
    transition: all 0.3s ease-in-out;
}
.glass-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.result-box {
    border-radius: 20px;
    padding: 1.5rem;
    height:80px;
    font-weight: 700;
    font-size: 1.5rem;
    text-align:center;
    margin-top: 1rem;
    box-shadow: 0 4px 25px rgba(0,0,0,0.25);
}
.tumor {
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
    color: white;
}
.no-tumor {
    background: linear-gradient(90deg, #00b09b, #96c93d);
    color: white;
}
.footer {
    text-align: center;
    margin-top: 3rem;
    padding: 1rem;
    font-size: 0.9rem;
    opacity: 0.8;
}
a { color: #00c6ff; text-decoration:none; }
a:hover { text-decoration: underline; }
div[data-testid="stDownloadButton"] button {
    background: linear-gradient(90deg, #ff416c, #ff4b2b);
    color: white;
    font-weight: 700;
    font-size: 18px;
    width:100%;
    height:70px;
    padding: 12px 24px;
    border-radius: 12px;
    transition: all 0.3s ease;
}
div[data-testid="stDownloadButton"] button:hover {
    background: linear-gradient(90deg, #ff4b2b, #ff416c);
    box-shadow: 0 6px 12px rgba(255, 75, 108, 0.6);
    cursor: pointer;
}
div[data-testid="stDownloadButton"] button span {
    font-size: 35px;
    font-weight: 800;
}
</style>
""",
    unsafe_allow_html=True,
)

# --- Sidebar and About ---
st.sidebar.title("🧠 NeuroScan AI")
st.sidebar.markdown("### An AI-Powered Brain Tumor Detector for Radiologists")

with st.sidebar.expander("👤 Patient Name:", expanded=True):
    st.markdown(f"**Name:** {st.session_state.patient_data['name']}")
    st.markdown(f"**ID:** {st.session_state.patient_data['id']}")
    st.markdown(f"**Age:** {st.session_state.patient_data['age']} years")
    st.markdown(f"**Gender:** {st.session_state.patient_data['gender']}")
    st.markdown(f"**Email:** {st.session_state.patient_data['email']}")

    if st.button("🔄 New Patient", key="new_patient"):
        st.session_state.patient_info_filled = False
        st.session_state.patient_data = {}
        st.rerun()

with st.sidebar.expander("📌 About NeuroScan AI", expanded=False):
    st.markdown(
        """
    **NeuroScan AI** is an AI-powered tool designed to assist radiologists in the early detection of brain tumors using MRI scans. 

    🔹 **Problem:** Brain tumors are life-threatening and manual diagnosis is time-consuming & prone to errors. 

    🔹 **Solution:** Our deep learning model analyzes MRI scans and detects the presence of tumors in **2–3 seconds Which Overcomes the problem with Manual process.**. 

    🔹 **How it works:**  
    1. Enter patient information  
    2. Upload MRI scan.  
    3. AI model processes the scan.  
    4. Result displayed with confidence score.  
    5. Download the Diagnosis Report with one click.  
    6. Chat with NeuroBot for collecting information regarding Neuro Related queries.

    🔹 **Why it matters:**  
    - Faster & more reliable screening  
    - Reduces workload for radiologists  
    - Acts as a **decision-support tool** (not a replacement for doctors) 

    🚀 *Our vision is to enhance clinical workflows, ensure faster diagnoses, and help save lives.*
    """
    )

# --- Lottie animation loader helper ---
def load_lottieurl(url: str):
    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception:
        return None


lottie_brain = load_lottieurl("https://assets10.lottiefiles.com/packages/lf20_cg3nq9.json")

# --- Header ---
col1, col2 = st.columns([2, 1])
with col1:
    st.markdown(
        """
<h1 class="custom-title">
🧠NeuroScan AI - An AI-Powered Brain Tumor Detector for Radiologists
</h1>

<style>
.custom-title {
    color: white;
    white-space: nowrap;
    text-align: center;
    font-size: 30px;
    width: 100%;
}
</style>
""",
        unsafe_allow_html=True,
    )

st.markdown(
    f"""
            <div style='
                font-size: 28px; 
                font-weight: 800; 
                color: #ffffff; 
                text-shadow: 0 4px 12px rgba(124,58,237,0.4); 
                margin: 20px 0; 
                padding: 12px 20px; 
                background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15)); 
                border-radius: 16px; 
                border: 2px solid rgba(255,255,255,0.2);
                text-align: center;
            '>
                👤 Patient Name:- {st.session_state.patient_data['name']} 
                <span style='color: #7c3aed; font-size: 24px;'>, ID: {st.session_state.patient_data['id']}</span>
            </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    f"""
<div style='
    font-size: 22px; 
    font-weight: 700; 
    color: #e6eef8; 
    text-shadow: 0 2px 8px rgba(0,0,0,0.5); 
    margin: 16px 0; 
    padding: 16px 24px; 
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); 
    border-radius: 20px; 
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    text-align: center;
    line-height: 1.6;
'>
    📤 <strong>Upload an MRI Scan</strong> and let <span style='color: #7c3aed; font-weight: 800;'>AI assist</span> 
    in detecting possible tumors with <span style='color: #06b6d4; font-weight: 800;'>modern deep learning models</span>
</div>
""",
    unsafe_allow_html=True,
)

with col2:
    if lottie_brain:
        st_lottie(lottie_brain, height=160, key="brain")

st.markdown("---")


# --- Generate report function with patient data ---
def generate_pdf_report(prediction_probs, class_names, patient_data, mri_image):
    """Generate PDF report with patient data & MRI image"""
    predicted_class = int(np.argmax(prediction_probs))
    confidence = float(prediction_probs[predicted_class] * 100)

    if predicted_class == 2:
        return None

    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch
    )
    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.HexColor("#1a1a1a"),
        spaceAfter=12,
        alignment=1,
        fontName="Helvetica-Bold",
    )

    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#2c3e50"),
        spaceAfter=10,
        spaceBefore=10,
        fontName="Helvetica-Bold",
    )

    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#34495e"),
        spaceAfter=6,
        leading=14,
    )

    elements.append(
        Paragraph("NeuroScan AI Brain Tumor Detection Report", title_style)
    )
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Patient Information", heading_style))
    patient_table_data = [
        ["Patient Name", patient_data["name"]],
        ["Patient ID", patient_data["id"]],
        ["Age", f"{patient_data['age']} years"],
        ["Gender", patient_data["gender"]],
        ["Email", patient_data["email"]],
        ["Report Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
    ]

    patient_table = Table(patient_table_data, colWidths=[2 * inch, 3.5 * inch])
    patient_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ]
        )
    )

    elements.append(patient_table)
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Analysis Results", heading_style))
    result_table_data = [
        ["Prediction", class_names[predicted_class]],
        ["Confidence Level", f"{confidence:.2f}%"],
        ["Model Type", "Convolutional Neural Network (CNN)"],
    ]

    result_table = Table(result_table_data, colWidths=[2 * inch, 3.5 * inch])
    result_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecf0f1")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ]
        )
    )

    elements.append(result_table)
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Clinical Findings", heading_style))
    if predicted_class == 1:
        findings_text = (
            "<b>⚠️ FINDING: Tumor Detected</b><br/><br/>"
            "The AI model detected a brain tumor in the provided MRI scan with a confidence level of "
            f"{confidence:.2f}%.<br/><br/>"
            "<b>RECOMMENDATIONS:</b><br/>"
            "• It is highly recommended to consult a qualified radiologist or neurologist for further evaluation.<br/>"
            "• Additional imaging studies may be required (CT, MR Spectroscopy, etc.).<br/>"
            "• Consider referring for specialist neurosurgical consultation if appropriate.<br/><br/>"
            "<b>DISCLAIMER:</b> This report serves as a decision-support tool and does not replace professional "
            "medical diagnosis. The final diagnosis must be made by a qualified healthcare professional."
        )
    else:
        findings_text = (
            "<b>✅ FINDING: No Tumor Detected</b><br/><br/>"
            "Based on the AI model analysis with a confidence level of {:.2f}%, no brain tumor was detected "
            "in the provided MRI scan.<br/><br/>"
            "<b>RECOMMENDATIONS:</b><br/>"
            "• Continue with routine monitoring as per clinical protocol.<br/>"
            "• Follow up imaging as clinically indicated.<br/><br/>"
            "<b>DISCLAIMER:</b> This report serves as a decision-support tool and does not replace professional "
            "medical diagnosis. The final diagnosis must be made by a qualified healthcare professional."
        ).format(confidence)

    elements.append(Paragraph(findings_text, normal_style))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("MRI Scan Image", heading_style))
    img_buffer = BytesIO()
    mri_image.save(img_buffer, format="PNG")
    img_buffer.seek(0)
    img = RLImage(img_buffer, width=4.5 * inch, height=4.5 * inch)
    elements.append(img)
    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph("Technical Information", heading_style))
    tech_info = (
        "<b>Analysis Confidence Breakdown:</b><br/>"
        f"• No Tumor Probability: {float(prediction_probs[0]) * 100:.2f}%<br/>"
        f"• Tumor Probability: {float(prediction_probs[1]) * 100:.2f}%<br/>"
        f"• Unsupported Probability: {float(prediction_probs[2]) * 100:.2f}%<br/><br/>"
    )

    elements.append(Paragraph(tech_info, normal_style))

    doc.build(elements)
    pdf_buffer.seek(0)
    return pdf_buffer


# --- File Upload and Prediction ---
uploaded_file = st.file_uploader(
    "📤 Upload MRI Scan (jpg, jpeg, png)", type=["jpg", "jpeg", "png"]
)

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("L")

    col_left, col_right = st.columns([1, 1])

    with col_left:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.image(image, caption="🖼 Uploaded Image", use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with col_right:
        try:
            img = np.array(image)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.reshape(1, IMG_SIZE, IMG_SIZE, 1) / 255.0

            with st.spinner("🔍 Analyzing image..."):
                pred = model.predict(img)[0]

            no_tumor_prob = float(pred[0])
            tumor_prob = float(pred[1])
            unsupported_prob = float(pred[2])

            fig = go.Figure(
                go.Indicator(
                    mode="gauge+number",
                    value=tumor_prob * 100,
                    title={"text": "Tumor Probability (%)"},
                    gauge={
                        "axis": {"range": [0, 100]},
                        "bar": {"color": "crimson"},
                        "steps": [
                            {"range": [0, 40], "color": "green"},
                            {"range": [40, 70], "color": "orange"},
                            {"range": [70, 100], "color": "red"},
                        ],
                    },
                )
            )
            fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", font={"color": "white"})
            st.plotly_chart(fig, use_container_width=True)

            predicted_class = int(np.argmax(pred))
            if predicted_class == 0:
                st.markdown(
                    '<div class="result-box no-tumor">✅ Prediction: No Tumor Detected</div>',
                    unsafe_allow_html=True,
                )
            elif predicted_class == 1:
                st.markdown(
                    '<div class="result-box tumor">🚨 Prediction: Tumor Detected</div>',
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    '<div class="result-box" style="background:gray; color:white;">⚠️ Image not supported. Please upload a valid MRI scan.</div>',
                    unsafe_allow_html=True,
                )

            class_names = ["No Tumor", "Tumor", "Unsupported Image"]

            if predicted_class != 2:
                pdf_report = generate_pdf_report(
                    pred, class_names, st.session_state.patient_data, image
                )
                confidence = float(pred[predicted_class] * 100)

                st.markdown(
                    """
                    <style>
                    div[data-testid="stDownloadButton"] > button {
                        height: 86px !important;
                        padding: 18px 28px !important;
                        background: linear-gradient(90deg, #ff416c, #ff4b2b) !important;
                        color: white !important;
                        font-weight: 900 !important;
                        font-size: 100px !important;
                        border-radius: 14px !important;
                        width: 630px;
                        box-shadow: 0 10px 30px rgba(255,65,108,0.35) !important;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1.0 !important;
                    }
                    div[data-testid="stDownloadButton"] > button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 16px 40px rgba(255,65,108,0.45) !important;
                    }
                    div[data-testid="stDownloadButton"] > button span {
                        font-size: 50px;
                        letter-spacing: 0.6px !important;
                        font-weight: 900 !important;
                    }
                    </style>
                    """,
                    unsafe_allow_html=True,
                )

                N8N_WEBHOOK_URL = (
                    "https://ajayyyy.app.n8n.cloud/webhook/neuroscan-report"
                )

                patient_email = st.session_state.patient_data["email"]
                email_provided = is_valid_email(patient_email)

                if email_provided:
                    pdf_base64 = base64.b64encode(pdf_report.getvalue()).decode()

                    n8n_data = {
                        "patient_name": st.session_state.patient_data["name"],
                        "patient_email": patient_email,
                        "patient_id": st.session_state.patient_data["id"],
                        "prediction": class_names[predicted_class],
                        "confidence": f"{confidence:.2f}%",
                        "report_pdf": pdf_base64,
                        "report_date": datetime.now().strftime(
                            "%Y-%m-%d %H:%M:%S"
                        ),
                    }

                    try:
                        response = requests.post(
                            N8N_WEBHOOK_URL, json=n8n_data, timeout=10
                        )
                        if response.status_code == 200:
                            st.success(f"📧 Report sent to {patient_email}")
                        else:
                            st.warning(
                                f"📧 Email sending failed (Status: {response.status_code}). Download manually below."
                            )
                    except Exception as e:
                        st.info(
                            f"📧 Email sending failed - download manually below. Error: {str(e)}"
                        )
                else:
                    st.info(
                        "📧 No valid email provided - download report manually"
                    )

                safe_name = (
                    st.session_state.patient_data["name"]
                    .replace(" ", "_")
                    .replace("/", "_")
                )
                st.download_button(
                    label="📥 Download Diagnostic PDF Report",
                    data=pdf_report,
                    file_name=f"neuroscan_report_{st.session_state.patient_data['id']}_{safe_name}.pdf",
                    mime="application/pdf",
                )
            else:
                st.warning(
                    "⚠️ Cannot generate report for unsupported image format."
                )

        except Exception as e:
            st.error(f"❌ Error processing image: {e}")
else:
    st.info("📌 Please upload an MRI scan image to start the prediction.")

st.markdown("---")

# --- Chatbot UI ---
user_query = st.text_input("Ask Questions to NeuroBot:", key="user_input")
st.markdown(
    """
    <style>
    label[for="user_input"] {
        font-size: 40px !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin-bottom: 6px !important;
        display: block !important;
    }
    #user_input {
        font-size: 18px !important;
        padding: 10px !important;
    }
    div[data-testid="stTextInput"] label[for="user_input"] {
        font-size: 28px !important;
        font-weight: 800 !important;
    }
    div[data-testid="stTextInput"] input {
        font-size: 18px !important;
    }
    @media (max-width: 640px) {
        label[for="user_input"] {
            font-size: 22px !important;
        }
        #user_input, div[data-testid="stTextInput"] input {
            font-size: 16px !important;
        }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

if user_query:
    st.session_state.chat_messages.append(
        {"role": "user", "content": user_query}
    )
    with st.spinner("NeuroScan AI is thinking..."):
        reply = get_ai_response(st.session_state.chat_messages)
    st.session_state.chat_messages.append(
        {"role": "assistant", "content": reply}
    )

if (
    st.session_state.chat_messages
    and st.session_state.chat_messages[-1]["role"] == "assistant"
):
    st.markdown(
        f"**NeuroBot (Gemini):** {st.session_state.chat_messages[-1]['content']}"
    )

st.markdown("---")
st.markdown(
    """
    <div class="footer">
    🧠 NeuroScan AI | AI-Powered Brain Tumor Detection | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
    </div>
    """,
    unsafe_allow_html=True,
)
