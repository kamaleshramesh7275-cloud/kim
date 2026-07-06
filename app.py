import os
import sys
import argparse
import datetime
from typing import Optional

# Ensure base directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from utils.data_loader import initialize_all_datasets, load_and_validate, save_dataset_file
from models.rag import MedicalRAGEngine

# CLI Fallback Mode
def run_cli_mode():
    print("=" * 60)
    print("      SMART RECOVERY AI - MEDICAL RECOMMENDATION CLI      ")
    print("=" * 60)
    print("This tool is for educational purposes. It is not a clinical substitute.")
    print("Type your symptoms below, or type 'exit' to quit.")
    print("-" * 60)
    
    # Initialize Engine
    engine = MedicalRAGEngine()
    
    # Load profile details
    record = engine.health_record
    print(f"Active Profile: Age {record.age} | Allergies: {record.allergies} | Chronic: {record.chronic_diseases}")
    print("-" * 60)

    # Main CLI Loop
    while True:
        try:
            query = input("\n[User]: ").strip()
            if not query:
                continue
            if query.lower() in ["exit", "quit", "q"]:
                print("Exiting. Keep healthy!")
                break
                
            print("\n[AI Assistant]: Analyzing symptoms and checking databases...")
            results = engine.search_and_recommend(query)
            
            # Print response
            print("\n" + results["reply"])
            
            if results["matched_symptoms"]:
                print(f"\n[Metadata] Detected Symptoms: {', '.join(results['matched_symptoms'])}")
            if results["matched_conditions"]:
                matches = [f"{name} ({conf*100:.1f}%)" for name, conf, _ in results["matched_conditions"]]
                print(f"[Metadata] Condition Matches: {', '.join(matches)}")
            if results["personalized_warnings"]:
                print("[Metadata] Profile Warnings:")
                for w in results["personalized_warnings"]:
                    print(f"  ⚠️ {w}")
            print("-" * 60)
            
        except KeyboardInterrupt:
            print("\nExiting. Stay safe!")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")

# Streamlit Mode
def run_streamlit_mode():
    import streamlit as st
    
    st.set_page_config(
        page_title="Smart Recovery AI - Health & Symptom Advisor",
        page_icon="🩺",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # CSS for premium dark/glassmorphic theme
    st.markdown("""
        <style>
        .stApp {
            background-color: #03060f;
            color: #e2e8f0;
        }
        .main-header {
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            text-align: center;
        }
        .sub-header {
            font-size: 1rem;
            color: #94a3b8;
            text-align: center;
            margin-bottom: 2rem;
        }
        .card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            backdrop-filter: blur(8px);
        }
        .allergy-alert {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: #fca5a5;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .success-box {
            background-color: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: #6ee7b7;
            margin-bottom: 1rem;
        }
        .disclaimer-box {
            background-color: rgba(245, 158, 11, 0.05);
            border-left: 4px solid #f59e0b;
            padding: 1rem;
            border-radius: 0.25rem;
            font-size: 0.85rem;
            color: #cbd5e1;
            margin-top: 2rem;
        }
        </style>
    """, unsafe_allow_html=True)

    # Initialize data and engine
    initialize_all_datasets()
    
    if "engine" not in st.session_state:
        st.session_state.engine = MedicalRAGEngine()
        
    engine = st.session_state.engine

    # --- SIDEBAR CONFIGURATION ---
    st.sidebar.markdown("<h2 style='color:#a855f7; font-weight:800; font-size:1.5rem;'>🩺 Patient Profile</h2>", unsafe_allow_html=True)
    st.sidebar.caption("Use this section to update medical records, allergies, and habits to personalize the RAG recommendations.")
    
    # Health Record inputs
    record = engine.health_record
    
    age = st.sidebar.number_input("Age", min_value=1, max_value=120, value=int(record.age or 30))
    height = st.sidebar.number_input("Height (cm)", min_value=30.0, max_value=250.0, value=float(record.height or 170.0))
    weight = st.sidebar.number_input("Weight (kg)", min_value=5.0, max_value=500.0, value=float(record.weight or 70.0))
    
    # Lists as comma-separated text fields
    allergies_text = st.sidebar.text_input("Allergies (comma-separated)", value=", ".join(record.allergies))
    chronic_text = st.sidebar.text_input("Chronic Diseases (comma-separated)", value=", ".join(record.chronic_diseases))
    meds_text = st.sidebar.text_input("Current Medications (comma-separated)", value=", ".join(record.medications))
    
    food_prefs_text = st.sidebar.text_input("Diet Preferences (e.g. vegetarian, vegan, none)", value=", ".join(record.food_preferences))
    exercise_level = st.sidebar.selectbox("Daily Exercise Level", ["sedentary", "light", "moderate", "active"], index=["sedentary", "light", "moderate", "active"].index(record.exercise_level or "moderate"))
    sleep_habits = st.sidebar.text_input("Sleep Habits", value=record.sleep_habits or "7-8 hours")

    if st.sidebar.button("Save Health Record Profile", type="primary"):
        # Save back to health record json
        updated_record = {
            "age": int(age),
            "height": float(height),
            "weight": float(weight),
            "allergies": [x.strip() for x in allergies_text.split(",") if x.strip()],
            "chronic_diseases": [x.strip() for x in chronic_text.split(",") if x.strip()],
            "medications": [x.strip() for x in meds_text.split(",") if x.strip()],
            "previous_illnesses": record.previous_illnesses,
            "food_preferences": [x.strip() for x in food_prefs_text.split(",") if x.strip()],
            "exercise_level": exercise_level,
            "sleep_habits": sleep_habits
        }
        save_dataset_file("health_records.json", updated_record)
        engine.refresh_data()
        st.sidebar.markdown("<div class='success-box'>✓ Profile saved successfully!</div>", unsafe_allow_html=True)

    st.sidebar.markdown("---")
    st.sidebar.markdown("<h3 style='color:#06b6d4; font-size:1.1rem;'>⚙️ AI Configuration</h3>", unsafe_allow_html=True)
    
    # API key setup
    api_key_env = os.environ.get("GEMINI_API_KEY", "")
    api_key = st.sidebar.text_input("Gemini API Key (Optional)", value=api_key_env, type="password", placeholder="Enter key for LLM Synthesis...")
    
    if api_key:
        st.sidebar.info("🚀 Online RAG mode enabled. Gemini will synthesize response documents.")
    else:
        st.sidebar.success("💡 Offline Mode active. Suggestions loaded directly from dataset files.")

    # History control
    st.sidebar.markdown("---")
    st.sidebar.markdown("<h3 style='color:#94a3b8; font-size:1.0rem;'>🧹 Data Management</h3>", unsafe_allow_html=True)
    if st.sidebar.button("Reset Conversation History"):
        empty_history = {"user_id": "default", "history": []}
        save_dataset_file("user_history.json", empty_history)
        engine.refresh_data()
        st.rerun()

    # --- MAIN VIEW ---
    st.markdown("<h1 class='main-header'>🩺 Smart Recovery AI</h1>", unsafe_allow_html=True)
    st.markdown("<div class='sub-header'>Retrieval-Augmented Generation & Personalised Health Advisor</div>", unsafe_allow_html=True)

    tab_chat, tab_datasets = st.tabs(["💬 Symptom Advisor Chat", "📂 Database Explorer"])

    # --- TAB 1: SYMPTOM ADVISOR ---
    with tab_chat:
        st.subheader("Consult your Recovery AI Assistant")
        st.caption("Type in your current symptoms below. The system will search local datasets, run health profile audits, and output detailed guidance.")

        # Suggestion Chips
        st.markdown("**Common queries to test:**")
        cols = st.columns(4)
        suggestions = [
            "I have a high fever.",
            "My throat is really sore and scratchy.",
            "I have loose watery stools and stomach cramps.",
            "I am sneezing constantly and have itchy watery eyes."
        ]
        
        selected_suggestion = None
        for idx, sug in enumerate(suggestions):
            if cols[idx].button(sug, key=f"sug_{idx}"):
                selected_suggestion = sug

        # Chat inputs
        user_query = st.chat_input("Describe how you feel (e.g. 'I have a sore throat, runny nose, and sneezing')...")
        
        query_to_run = selected_suggestion or user_query

        if query_to_run:
            st.chat_message("user").markdown(f"**Query**: {query_to_run}")
            
            with st.spinner("Retrieving details and checking profile conflicts..."):
                results = engine.search_and_recommend(query_to_run, api_key=api_key if api_key else None)
                
            # Display warnings if present
            if results["personalized_warnings"]:
                for w in results["personalized_warnings"]:
                    st.markdown(f"<div class='allergy-alert'>⚠️ {w}</div>", unsafe_allow_html=True)
            
            # Display detected symptoms & confidence maps
            col_sym, col_conf = st.columns(2)
            with col_sym:
                if results["matched_symptoms"]:
                    st.info(f"**Detected Symptoms:** {', '.join(results['matched_symptoms'])}")
                else:
                    st.info("**Detected Symptoms:** None directly matched (using fallback name search)")
            with col_conf:
                if results["matched_conditions"]:
                    matches = [f"{name} ({conf*100:.1f}%)" for name, conf, _ in results["matched_conditions"]]
                    st.success(f"**Possible Conditions:** {', '.join(matches)}")
                else:
                    st.warning("**Possible Conditions:** No direct condition map found")

            # Main AI Output
            st.chat_message("assistant").markdown(results["reply"])

        # History list
        st.markdown("---")
        st.subheader("📜 Recent Consultations")
        history_list = engine.user_history.history
        if history_list:
            for item in reversed(history_list[-5:]): # Show last 5 logs
                with st.expander(f"Consultation: {item.get('date', '')} - Symptoms: {', '.join(item.get('symptoms', []))}"):
                    st.write("**Recommendations Saved:**")
                    st.write(item.get("recommendations", {}))
        else:
            st.write("No previous history logs found.")

    # --- TAB 2: DATABASE EXPLORER ---
    with tab_datasets:
        st.subheader("Browse Knowledge Base Datasets")
        st.caption("Here you can inspect the raw structured medical and health files that drive the semantic RAG matching.")
        
        db_options = [
            "disease_information.json",
            "food_recommendations.json",
            "exercise_recommendations.json",
            "recovery_tips.json",
            "medicine_precautions.json",
            "emergency_symptoms.json",
            "nutrition_data.json",
            "lifestyle_recommendations.json",
            "symptom_mapping.json",
            "health_records.json",
            "user_history.json"
        ]
        selected_db = st.selectbox("Select Dataset File to Inspect", db_options)
        
        if selected_db:
            try:
                db_data = load_and_validate(selected_db)
                if hasattr(db_data, "model_dump"):
                    st.json(db_data.model_dump())
                else:
                    st.json(db_data)
            except Exception as e:
                st.error(f"Error loading {selected_db}: {e}")

    # Global medical footer disclaimer
    st.markdown("""
        <div class='disclaimer-box'>
        <strong>⚠️ Medical Disclaimer:</strong><br>
        The information provided by this system is intended for general educational and athletic recovery purposes only. 
        It is not a substitute for professional medical advice, clinical diagnosis, or medical treatment. 
        If you are experiencing severe, worsening symptoms (including severe breathing issues, chest pain, confusion, or persistent high fever), 
        please consult a physician or visit your nearest emergency room immediately.
        </div>
    """, unsafe_allow_html=True)


if __name__ == "__main__":
    # Setup argparse to handle CLI fallback argument
    parser = argparse.ArgumentParser(description="Smart Recovery AI recommendation engine.")
    parser.add_argument("--cli", action="store_true", help="Run in command line interface mode instead of Streamlit.")
    args = parser.parse_args()

    if args.cli:
        run_cli_mode()
    else:
        # Check if streamlit is imported and run. If not, trigger CLI or print instructions.
        try:
            import streamlit
            run_streamlit_mode()
        except ImportError:
            print("Streamlit package is not installed. Defaulting to CLI mode.")
            run_cli_mode()
