import os
import streamlit as st
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from PIL import Image
from streamlit_lottie import st_lottie
import requests
import plotly.graph_objects as go

# --- Page config (must be before any UI) ---
st.set_page_config(
    page_title="NeuroScan AI",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'About': "🧠 AI-powered Brain Tumor Detection App built with Streamlit",
        'Report a bug': 'mailto:support@example.com',
        'Get help': 'https://yourdomain.com/privacy'
    }
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
            )
        }
    ]



def login_ui():
    """
    Compact, sleek login UI - removes the large top spacing so the small top header and
    the login card sit closer together (as requested).

    Replace your existing login_ui() with this function.
    I've marked the key changes with comments starting with "CHANGE:" so you can find them quickly.
    """
    st.markdown(
        """
        <style>
        /* ------------------------------
           TOP BAR (compact)
           CHANGE: reduced padding so header occupies less vertical space
           ------------------------------ */
        .ns-topbar {
            display:flex;
            align-items:center;
            gap:12px;
            padding:8px 12px;                            /* CHANGE: was 12px 20px -> smaller */
            width:100%;
            box-sizing:border-box;
            background: linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));
            border-bottom: 1px solid rgba(255,255,255,0.02);
            position: sticky;
            top: 0;
            z-index: 999;
        }
        .ns-logo {
            width:40px;                                  /* CHANGE: smaller logo */
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
            font-size: 16px;                              /* CHANGE: slightly smaller */
            margin: 0;
            line-height:1;
        }
        .ns-sub {
            color:#9fb3dd;
            font-size:11px;                               /* CHANGE: slightly smaller */
            margin:0;
            opacity:0.95;
        }

        /* ------------------------------
           PAGE container
           CHANGE: removed large min-height and reduced padding to remove extra blank space
           ------------------------------ */
        .ns-page {
            background: linear-gradient(180deg,#071226 0%, #0c1b2b 100%);
            min-height: auto;                             /* CHANGE: was calc(100vh - 64px) */
            padding: 10px 12px;                           /* CHANGE: was 36px 16px -> smaller */
            box-sizing: border-box;
        }

        /* ------------------------------
           Centered card
           CHANGE: reduced top margin so the card sits close under the header
           ------------------------------ */
        .ns-card {
            width:420px;
            max-width:96%;
            margin: 10px auto;                            /* CHANGE: was 26px auto -> smaller */
            background: rgba(255,255,255,0.025);
            border-radius: 12px;                          /* slightly tighter radius */
            padding: 20px;                                /* CHANGE: reduced padding */
            box-shadow: 0 10px 28px rgba(2,6,23,0.55);
            border: 1px solid rgba(255,255,255,0.025);
            color: #e6eef8;
            font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto;
        }

        .ns-heading {
            font-size:18px;                               /* smaller heading to fit compact layout */
            font-weight:800;
            margin: 0 0 6px 0;
            color: #ffffff;
        }
        .ns-lead {
            font-size:13px;
            color:#9fb3dd;
            margin:0 0 12px 0;                            /* slightly less spacing */
        }

        /* Labels */
        .ns-label {
            display:block;
            color:#d8e3f0 !important;
            font-weight:700 !important;
            font-size:13px !important;
            margin-bottom:6px;                            /* tighter spacing */
        }

        /* Inputs: sleek with subtle inner shadow and focused gradient border */
        .ns-input input {
            width:100% !important;
            padding:10px 12px !important;                /* smaller padding */
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
            padding:10px 12px;                            /* smaller */
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

    # compact form for grouped inputs + enter-key submit
    with st.form("login_form_compact", clear_on_submit=False):
        # Username
        st.markdown('<label class="ns-label" for="username">Username</label>', unsafe_allow_html=True)
        username = st.text_input("", key="username", placeholder="radiologist", label_visibility="collapsed")

        st.markdown('<div style="height:6px"></div>', unsafe_allow_html=True)

        # Password + show toggle
        st.markdown('<label class="ns-label" for="password">Password</label>', unsafe_allow_html=True)
        password = st.text_input("", type="password", key="password", placeholder="Enter your password", label_visibility="collapsed")

        # Remember & forgot row (compact)
        remember = st.checkbox("Remember me", value=False, key="remember_me")
        st.markdown('<div class="ns-row"><div></div><div><a href="#" style="color:#9fb3dd;text-decoration:none;font-weight:700;">Forgot?</a></div></div>', unsafe_allow_html=True)

        submitted = st.form_submit_button("Sign In")

        # compact demo note (non-intrusive)
        st.markdown('<div class="ns-small">Use <strong>radiologist</strong> / <strong>secure123</strong> for demo access</div>', unsafe_allow_html=True)

        if submitted:
            # basic validation
            if (username or "").strip() == "" or (password or "") == "":
                st.error("Please enter both username and password.")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return False

            # simple auth check
            if username == "radiologist" and password == "secure123":
                st.session_state.logged_in = True
                st.success("✅ Login successful — redirecting...")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return True
            else:
                st.error("❌ Invalid username or password")
                st.markdown("</div></div>", unsafe_allow_html=True)
                return False

    # close wrappers when form not submitted
    st.markdown("</div></div>", unsafe_allow_html=True)
    return False

# --- Show login UI and stop if not authenticated ---
if not st.session_state.logged_in:
    logged_in_now = login_ui()
    if not logged_in_now:
        st.stop()

# --- User is authenticated; main app continues below ---

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

# --- OpenRouter API config for Neuro Chatbot ---
# Safely attempt to read from st.secrets, but fall back to environment variables if no secrets file exists.
OPENROUTER_API_KEY = None

# Import the specific Streamlit exception class if available; fallback to a broad Exception if not.
try:
    from streamlit.errors import StreamlitSecretNotFoundError
except Exception:
    StreamlitSecretNotFoundError = Exception

try:
    # Try to get the key from st.secrets (this may raise StreamlitSecretNotFoundError if no secrets file exists)
    OPENROUTER_API_KEY = st.secrets["OPENROUTER_API_KEY"]
except (StreamlitSecretNotFoundError, KeyError):
    # Either no secrets file or key missing -> fallback to environment variable
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", None)
except Exception:
    # Any other unexpected error -> fallback to environment variable as a safety net
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", None)

if not OPENROUTER_API_KEY:
    st.warning("OpenRouter API key not found. Chatbot will be disabled. Set st.secrets['OPENROUTER_API_KEY'] or environment variable OPENROUTER_API_KEY.")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_ID = "openai/gpt-4o-mini"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}" if OPENROUTER_API_KEY else "",
    "Content-Type": "application/json"
}

def get_ai_response(messages):
    if not OPENROUTER_API_KEY:
        return "Chatbot is disabled because the OpenRouter API key is not configured."
    json_data = {
        "model": MODEL_ID,
        "messages": messages,
        "max_tokens": 300,
        "temperature": 0.7
    }
    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=json_data, timeout=30)
    except Exception as e:
        return f"Error calling OpenRouter: {e}"
    if response.status_code == 200:
        data = response.json()
        try:
            return data['choices'][0]['message']['content']
        except Exception:
            return str(data)
    else:
        return f"Error: {response.status_code} - {response.text}"

# --- Custom CSS (app styling) ---
st.markdown("""
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
/* Download button style */
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
""", unsafe_allow_html=True)

# --- Sidebar and About ---
st.sidebar.title("🧠 NeuroScan AI")
st.sidebar.markdown("### An AI-Powered Brain Tumor Detector for Radiologists")

with st.sidebar.expander("📌 About NeuroScan AI", expanded=True):
    st.markdown("""
    **NeuroScan AI** is an AI-powered tool designed to assist radiologists in the early detection of brain tumors using MRI scans.  

    🔹 **Problem:** Brain tumors are life-threatening and manual diagnosis is time-consuming & prone to errors.  

    🔹 **Solution:** Our deep learning model analyzes MRI scans and detects the presence of tumors in **2–3 seconds Which Overcomes the problem with Manual process.**.  

    🔹 **How it works:**  
    1. Upload MRI scan.
    2. AI model processes the scan.
    3. Result displayed with confidence score.
    4. Download the Diagnosis Report with one click.
    5. Chat with NeuroBot for collecting information regarding Neuro Related queries.

    🔹 **Why it matters:**  
    - Faster & more reliable screening  
    - Reduces workload for radiologists  
    - Acts as a **decision-support tool** (not a replacement for doctors)  

    🚀 *Our vision is to enhance clinical workflows, ensure faster diagnoses, and help save lives.*
    """)

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
col1, col2 = st.columns([2,1])
with col1:
    st.markdown("""
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
""", unsafe_allow_html=True)

    st.write("Upload an **MRI Scan** and let AI assist in detecting possible tumors with modern deep learning models.")
with col2:
    if lottie_brain:
        st_lottie(lottie_brain, height=160, key="brain")

st.markdown("---")

# --- File Upload and Prediction ---
uploaded_file = st.file_uploader("📤 Upload MRI Scan (jpg, jpeg, png)", type=["jpg","jpeg","png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("L")

    col_left, col_right = st.columns([1,1])

    with col_left:
        st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
        st.image(image, caption="🖼 Uploaded Image", use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    with col_right:
        try:
            # Preprocess
            img = np.array(image)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.reshape(1, IMG_SIZE, IMG_SIZE, 1) / 255.0

            with st.spinner("🔍 Analyzing image..."):
                pred = model.predict(img)[0]

            # 3 classes: no tumor, tumor, unsupported
            no_tumor_prob = float(pred[0])
            tumor_prob = float(pred[1])
            unsupported_prob = float(pred[2])

            fig = go.Figure(go.Indicator(
                mode="gauge+number",
                value=tumor_prob*100,
                title={'text': "Tumor Probability (%)"},
                gauge={'axis': {'range': [0, 100]},
                       'bar': {'color': "crimson"},
                       'steps': [
                           {'range': [0, 40], 'color': "green"},
                           {'range': [40, 70], 'color': "orange"},
                           {'range': [70, 100], 'color': "red"}]}))
            fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", font={'color':"white"})
            st.plotly_chart(fig, use_container_width=True)

            predicted_class = int(np.argmax(pred))
            if predicted_class == 0:
                st.markdown('<div class="result-box no-tumor">✅ Prediction: No Tumor Detected</div>', unsafe_allow_html=True)
            elif predicted_class == 1:
                st.markdown('<div class="result-box tumor">🚨 Prediction: Tumor Detected</div>', unsafe_allow_html=True)
            else:
                st.markdown('<div class="result-box" style="background:gray; color:white;">⚠️ Image not supported. Please upload a valid MRI scan.</div>', unsafe_allow_html=True)

            # Generate report text
            def generate_report(prediction_probs, class_names):
                predicted_class = int(np.argmax(prediction_probs))
                confidence = float(prediction_probs[predicted_class] * 100)

                if predicted_class == 2:  # Unsupported
                    return "Image is not a valid MRI scan. Please upload a proper MRI scan for analysis."

                report = "NeuroScan AI Brain Tumor Detection Report\n"
                report += "---------------------------------------\n"
                report += f"Prediction: {class_names[predicted_class]}\n"
                report += f"Confidence: {confidence:.2f}%\n\n"
                if predicted_class == 1:  # Tumor detected
                    report += (
                        "Findings: \n"
                        "The AI model detected a brain tumor in the provided MRI scan with a high confidence level.\n"
                        "It is highly recommended to consult a qualified radiologist or neurologist for further evaluation.\n"
                        "This report serves as a support tool and does not replace professional medical diagnosis.\n"
                    )
                else:
                    report += "Findings: \n"
                    report += "No brain tumor was detected in the MRI scan based on current AI model analysis.\n"

                report += "\nThank you for using NeuroScan AI."

                return report

            class_names = ['No Tumor', 'Tumor', 'Unsupported Image']
            report = generate_report(pred, class_names)

            st.markdown(
            """
            <style>
            /* Make all Streamlit download buttons larger and bolder */
            div[data-testid="stDownloadButton"] > button {
                height: 86px !important;
                padding: 18px 28px !important;
                background: linear-gradient(90deg, #ff416c, #ff4b2b) !important;
                color: white !important;
                font-weight: 900 !important;
                font-size: 100px !important;      /* larger label text */
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
            /* The inner span contains the label text — enlarge it too */
            div[data-testid="stDownloadButton"] > button span {
                font-size: 50px;
                letter-spacing: 0.6px !important;
                font-weight: 900 !important;
                
            }
            </style>
            """,
            unsafe_allow_html=True,
        )
        
        # Use the normal st.download_button call (it will inherit the CSS above)
            st.download_button(
                label="📥 Download Diagnostic Report (Click to Save)",
                data=report,
                file_name="neuroscan_report.txt",
                mime="text/plain",
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
    /* Make the "Ask your neuroscience question" label much larger and bolder */
    label[for="user_input"] {
        font-size: 40px !important;       /* label text size */
        font-weight: 800 !important;
        color: #ffffff !important;
        margin-bottom: 6px !important;
        display: block !important;
    }

    /* Increase the input text size so typed text is easier to read */
    #user_input {
        font-size: 18px !important;
        padding: 10px !important;
    }

    /* If Streamlit wraps the input in another container, also target the common wrapper */
    div[data-testid="stTextInput"] label[for="user_input"] {
        font-size: 28px !important;
        font-weight: 800 !important;
    }
    div[data-testid="stTextInput"] input {
        font-size: 18px !important;
    }

    /* Responsive tweak for small screens */
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
    st.session_state.chat_messages.append({"role": "user", "content": user_query})
    with st.spinner("NeuroScan AI is thinking..."):
        reply = get_ai_response(st.session_state.chat_messages)
    st.session_state.chat_messages.append({"role": "assistant", "content": reply})

if st.session_state.chat_messages and st.session_state.chat_messages[-1]['role'] == 'assistant':
    st.markdown(f"**NeuroBot:** {st.session_state.chat_messages[-1]['content']}")

# --- Footer ---
