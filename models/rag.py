import datetime
from typing import Dict, List, Any, Optional, Tuple
import google.generativeai as genai
from utils.data_loader import load_and_validate, save_dataset_file
from utils.helpers import match_symptoms_in_query, calculate_disease_confidence, clean_text

class MedicalRAGEngine:
    def __init__(self):
        self.refresh_data()

    def refresh_data(self):
        """Reload all datasets from JSON files."""
        self.diseases_data = load_and_validate("disease_information.json").diseases
        self.food_data = load_and_validate("food_recommendations.json").recommendations
        self.exercise_data = load_and_validate("exercise_recommendations.json").recommendations
        self.recovery_data = load_and_validate("recovery_tips.json").recommendations
        self.medicine_data = load_and_validate("medicine_precautions.json").recommendations
        self.emergency_data = load_and_validate("emergency_symptoms.json").recommendations
        self.nutrition_data = load_and_validate("nutrition_data.json").recommendations
        self.symptom_mapping = load_and_validate("symptom_mapping.json").mapping
        self.lifestyle_data = load_and_validate("lifestyle_recommendations.json").recommendations
        
        # User dynamic files
        self.health_record = load_and_validate("health_records.json")
        self.user_history = load_and_validate("user_history.json")

    def search_and_recommend(self, query: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Main entrypoint. Takes query, matches conditions, retrieves data,
        applies personalization, and generates the response.
        """
        self.refresh_data()
        
        # 1. Detect symptoms in query
        matched_symptoms = match_symptoms_in_query(query, self.symptom_mapping)
        
        # If no symptoms matched directly, try checking if the raw query contains any disease name
        matched_conditions = []
        if matched_symptoms:
            # Calculate match confidence
            disease_info_dicts = [d.model_dump() for d in self.diseases_data]
            matched_conditions = calculate_disease_confidence(
                matched_symptoms, disease_info_dicts, self.symptom_mapping
            )
        else:
            # Fallback direct lookup of disease name in text
            query_lower = query.lower()
            for d in self.diseases_data:
                if d.disease_name.lower() in query_lower:
                    matched_conditions.append((d.disease_name, 1.0, d.symptoms))
        
        # If still nothing matched, handle empty case
        if not matched_conditions:
            return self._build_empty_response(query, api_key)

        # 2. Retrieve resources for the matched diseases
        primary_disease = matched_conditions[0][0]
        primary_confidence = matched_conditions[0][1]
        
        # Collect context for the matching conditions
        context_data = []
        for disease_name, confidence, symptoms in matched_conditions[:3]:  # Top 3 matches
            disease_info = next((d for d in self.diseases_data if d.disease_name == disease_name), None)
            if not disease_info:
                continue
                
            info = {
                "disease_name": disease_name,
                "confidence": confidence,
                "description": disease_info.description,
                "severity": disease_info.severity,
                "matched_symptoms": symptoms,
                "foods": self.food_data.get(disease_name),
                "exercises": self.exercise_data.get(disease_name),
                "recovery": self.recovery_data.get(disease_name),
                "medicine": self.medicine_data.get(disease_name),
                "emergency": self.emergency_data.get(disease_name),
                "nutrition": self.nutrition_data.get(disease_name),
                "lifestyle": self.lifestyle_data.get(disease_name),
            }
            context_data.append(info)

        # 3. Personalize using Health Record
        personalized_warnings = []
        allergies = self.health_record.allergies
        chronic_diseases = self.health_record.chronic_diseases
        medications = self.health_record.medications
        food_preferences = self.health_record.food_preferences
        
        # Check allergies against recommended foods
        filtered_context_data = []
        for info in context_data:
            rec_foods = list(info["foods"].recommended) if info["foods"] else []
            avoid_foods = list(info["foods"].avoid) if info["foods"] else []
            
            clean_rec_foods = []
            for food in rec_foods:
                has_allergen = False
                for allergen in allergies:
                    if allergen.lower() in food.lower():
                        has_allergen = True
                        msg = f"Alert: Food '{food}' contains allergen '{allergen}' and has been flagged/excluded."
                        if msg not in personalized_warnings:
                            personalized_warnings.append(msg)
                
                # Check dietary preferences
                is_vegetarian = "vegetarian" in [p.lower() for p in food_preferences]
                is_vegan = "vegan" in [p.lower() for p in food_preferences]
                if is_vegetarian and ("chicken" in food.lower() or "beef" in food.lower() or "fish" in food.lower() or "bone broth" in food.lower()):
                    personalized_warnings.append(f"Preference check: Excluded '{food}' due to Vegetarian preference.")
                    continue
                if is_vegan and ("chicken" in food.lower() or "beef" in food.lower() or "fish" in food.lower() or "bone broth" in food.lower() or "egg" in food.lower() or "yogurt" in food.lower() or "milk" in food.lower() or "honey" in food.lower()):
                    personalized_warnings.append(f"Preference check: Excluded '{food}' due to Vegan preference.")
                    continue
                    
                if not has_allergen:
                    clean_rec_foods.append(food)
            
            # Check chronic disease conflicts (e.g. Asthma, High blood pressure)
            if "asthma" in [c.lower() for c in chronic_diseases] and info["disease_name"] in ["Seasonal Allergies", "Cold", "Flu"]:
                personalized_warnings.append("Medical Alert: Since you have Asthma, watch out for chest tightness and carry your albuterol inhaler (as needed).")
                
            info["recommended_foods_filtered"] = clean_rec_foods
            filtered_context_data.append(info)

        # 4. Filter out ineffective historical treatments
        # Look for negative/ineffective notes in user history
        ineffective_items = []
        for entry in self.user_history.history:
            # If historical entry notes that symptoms did not improve
            if getattr(entry, "status", None) == "ineffective":
                # Save these recommendations so we avoid recommending them or warn the user
                for cat, items in entry.recommendations.items():
                    ineffective_items.extend(items)
        
        # Filter out ineffective items and issue warning
        for info in filtered_context_data:
            orig_foods = info["recommended_foods_filtered"]
            final_foods = []
            for f in orig_foods:
                if any(ineff.lower() in f.lower() or f.lower() in ineff.lower() for ineff in ineffective_items):
                    personalized_warnings.append(f"History note: '{f}' was previously marked as ineffective for your recovery, so we advise caution.")
                final_foods.append(f)
            info["recommended_foods_filtered"] = final_foods

        # 5. Check if we have an API Key. If so, execute LLM-based Synthesis (Online RAG)
        if api_key:
            try:
                reply = self._generate_llm_response(query, filtered_context_data, personalized_warnings, api_key)
            except Exception as e:
                # Fallback to local rule-based structured generator on LLM failure
                reply = self._generate_local_response(query, filtered_context_data, personalized_warnings)
                personalized_warnings.append(f"System: LLM synthesis failed ({e}). Using local rule-based advisor.")
        else:
            # Fallback to local rule-based structured generator
            reply = self._generate_local_response(query, filtered_context_data, personalized_warnings)

        # 6. Save current recommendation in user history
        # Build recommendation log
        current_recommendations = {
            "food": filtered_context_data[0]["recommended_foods_filtered"] if filtered_context_data[0]["foods"] else [],
            "exercise": filtered_context_data[0]["exercises"].recommended if filtered_context_data[0]["exercises"] else []
        }
        
        # Save history entry
        from models.schema import HistoryEntry
        new_entry = HistoryEntry(
            date=datetime.date.today().strftime("%Y-%m-%d"),
            symptoms=matched_symptoms if matched_symptoms else [query],
            recommendations=current_recommendations
        )
        
        # Append to user history json
        self.user_history.history.append(new_entry)
        save_dataset_file("user_history.json", self.user_history)

        return {
            "reply": reply,
            "matched_symptoms": matched_symptoms,
            "matched_conditions": matched_conditions,
            "personalized_warnings": personalized_warnings
        }

    def _build_empty_response(self, query: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Generate response when no symptoms could be matched."""
        disclaimer = "\n\n*(Disclaimer: This is for educational and guidance purposes only. If you are experiencing symptoms, please consult a qualified healthcare professional.)*"
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-2.5-flash")
                prompt = (
                    f"You are a medical intelligence assistant. The user asked: '{query}'. "
                    "We did not detect specific symptoms or match diseases in our database. "
                    "Provide a helpful, cautious, general response explaining how they can check their symptoms, "
                    "remind them of general health hygiene, and strongly advise consulting a healthcare professional."
                    "\nAlways state clearly that you are an educational tool and not a substitute for medical advice."
                )
                response = model.generate_content(prompt)
                return {
                    "reply": response.text + disclaimer,
                    "matched_symptoms": [],
                    "matched_conditions": [],
                    "personalized_warnings": []
                }
            except Exception as e:
                pass
                
        reply = (
            "I could not detect any common symptoms or match a specific illness in my database.\n\n"
            "**What you should do:**\n"
            "- Monitor your symptoms closely (temperature, energy levels, pain).\n"
            "- Keep well-hydrated with water and get plenty of rest.\n"
            "- If you feel unwell, have a persistent fever, or have difficulty breathing, please seek immediate attention from a medical professional."
            + disclaimer
        )
        return {
            "reply": reply,
            "matched_symptoms": [],
            "matched_conditions": [],
            "personalized_warnings": []
        }

    def _generate_local_response(self, query: str, context_data: List[Dict[str, Any]], personalized_warnings: List[str]) -> str:
        """Formulate a beautiful rule-based local template response matching the example structure."""
        primary = context_data[0]
        
        # 1. Condition Title and confidence levels
        condition_sec = f"### Possible Condition\n\n"
        for c in context_data:
            condition_sec += f"* **{c['disease_name']}** (Confidence: {c['confidence']*100:.1f}%)\n"
            condition_sec += f"  *Description: {c['description']}*\n"
        if len(context_data) > 1:
            condition_sec += "\n*Note: Multiple matches found. Please review the confidence scores and match details.*\n"

        # 2. Foods
        food_sec = "### Recommended Foods\n\n"
        foods = primary.get("recommended_foods_filtered", [])
        if foods:
            for f in foods:
                # Add explanation
                explanation = self._explain_food(f, primary['disease_name'])
                food_sec += f"* {f} ({explanation})\n"
        else:
            food_sec += "* No specific foods recommended. Stick to light, easily-digestible meals.\n"

        # 3. Hydration
        drink_sec = "### Drink More\n\n"
        nutrition = primary.get("nutrition")
        if nutrition:
            drink_sec += f"* {nutrition.hydration_advice}\n"
            drink_sec += f"* Electrolytes advice: {nutrition.electrolytes}\n"
        else:
            drink_sec += "* Plenty of water (at least 2-3 liters/day)\n* Clear broths or electrolyte fluids if dehydrated\n"

        # 4. Avoid
        avoid_sec = "### Avoid\n\n"
        food_rec = primary.get("foods")
        if food_rec and food_rec.avoid:
            for av in food_rec.avoid:
                avoid_sec += f"* {av}\n"
        else:
            avoid_sec += "* Heavy, greasy, fatty foods\n* Alcohol and excess caffeine\n"

        # 5. Recovery Tips
        recovery_sec = "### Recovery Tips\n\n"
        rec_tips = primary.get("recovery")
        if rec_tips and rec_tips.tips:
            for tip in rec_tips.tips:
                recovery_sec += f"* {tip}\n"
        else:
            recovery_sec += "* Rest and avoid physical strain.\n* Monitor your temperature and symptoms.\n"

        # 6. Exercise
        exercise_sec = "### Exercise\n\n"
        ex_rec = primary.get("exercises")
        if ex_rec:
            exercise_sec += f"* **Severity-based Guidance**: {ex_rec.notes}\n"
            exercise_sec += "\n**Recommended movement:**\n"
            for item in ex_rec.recommended:
                exercise_sec += f"- {item}\n"
            exercise_sec += "\n**Avoid movement:**\n"
            for item in ex_rec.avoid:
                exercise_sec += f"- {item}\n"
        else:
            exercise_sec += "* No specific exercise recommendations. Standard rest is advised during acute illness.\n"

        # 7. Warning Signs
        warning_sec = "### Important Warning Signs\n"
        warning_sec += "**Seek immediate medical care if you experience:**\n\n"
        emerg = primary.get("emergency")
        if emerg and emerg.warning_signs:
            for sign in emerg.warning_signs:
                warning_sec += f"* {sign}\n"
            warning_sec += f"\n*Contact: {emerg.emergency_contact}*\n"
        else:
            warning_sec += "* Difficulty breathing\n* Chest pain\n* Severe dizziness or confusion\n* Symptoms lasting more than 3-5 days or worsening\n"

        # 8. Personalization Section
        personalization_sec = "### Personalized Recommendations\n"
        personalization_sec += f"Based on your profile (Age: {self.health_record.age}, Allergies: {', '.join(self.health_record.allergies) if self.health_record.allergies else 'none'}):\n\n"
        if personalized_warnings:
            for warn in personalized_warnings:
                personalization_sec += f"* {warn}\n"
        else:
            personalization_sec += "* No dietary or chronic disease conflicts detected. Continue following the guidelines.\n"

        disclaimer = (
            "\n---\n"
            "**Medical Disclaimer:** I am an AI chatbot helper providing educational recovery and nutrition suggestions based on local datasets. "
            "I do not provide professional medical diagnoses, prescriptions, or clinical treatments. If symptoms are severe, worsening, or include any red flags, "
            "please consult a qualified healthcare professional immediately."
        )

        response = "\n\n".join([
            condition_sec, food_sec, drink_sec, avoid_sec, recovery_sec, exercise_sec, warning_sec, personalization_sec
        ]) + disclaimer
        
        return response

    def _generate_llm_response(self, query: str, context_data: List[Dict[str, Any]], personalized_warnings: List[str], api_key: str) -> str:
        """Use Gemini API to synthesize the response with context data (Online RAG)."""
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Build context string
        context_str = ""
        for c in context_data:
            context_str += f"Condition: {c['disease_name']} (Confidence: {c['confidence']*100:.1f}%)\n"
            context_str += f"Description: {c['description']}\n"
            context_str += f"Severity: {c['severity']}\n"
            if c['foods']:
                context_str += f"Recommended Foods: {', '.join(c['recommended_foods_filtered'])}\n"
                context_str += f"Foods to Avoid: {', '.join(c['foods'].avoid)}\n"
            if c['nutrition']:
                context_str += f"Hydration Advice: {c['nutrition'].hydration_advice}\n"
                context_str += f"Electrolytes: {c['nutrition'].electrolytes}\n"
            if c['recovery']:
                context_str += f"Recovery Tips: {'; '.join(c['recovery'].tips)}\n"
            if c['exercises']:
                context_str += f"Exercise Notes: {c['exercises'].notes}\n"
                context_str += f"Recommended Exercises: {', '.join(c['exercises'].recommended)}\n"
                context_str += f"Avoid Exercises: {', '.join(c['exercises'].avoid)}\n"
            if c['emergency']:
                context_str += f"Emergency Warning Signs: {'; '.join(c['emergency'].warning_signs)}\n"
            if c['medicine']:
                context_str += f"Common OTC Meds: {', '.join(c['medicine'].medications)}\n"
                context_str += f"Medication Precautions: {'; '.join(c['medicine'].precautions)}\n"
            context_str += "---\n"

        prompt = f"""You are an advanced medical recommendation assistant operating via Retrieval-Augmented Generation (RAG).
Your goal is to formulate a structured, highly personalized, and medically cautious response based on the local databases and health records.

Here is the user query: "{query}"

Below are the matched database records from our local medical knowledge files:
{context_str}

Personalized warnings from checking the user's Health Profile (Allergies, Chronic Diseases, dietary preferences, history):
{"; ".join(personalized_warnings) if personalized_warnings else "No critical profile conflicts detected."}

The user's health profile:
- Age: {self.health_record.age}
- Allergies: {self.health_record.allergies}
- Chronic Conditions: {self.health_record.chronic_diseases}
- Food Preferences: {self.health_record.food_preferences}
- Current Medications: {self.health_record.medications}

Instructions:
1. Formulate the response with exactly these sections:
   - **Possible Condition** (with confidence score, explanation, and severity description)
   - **Recommended Foods** (list recommended foods, explain WHY each is good for this specific condition)
   - **Drink More** (hydration and electrolyte advice)
   - **Avoid** (foods, drinks, habits to avoid)
   - **Recovery Tips** (rest, home care solutions)
   - **Exercise** (severity-based exercise instructions, exercises to do/avoid)
   - **Important Warning Signs** (emergency warning signs requiring immediate medical care)
   - **Personalized Recommendations** (integrate details from the allergies, chronic conditions, and explain how the advice was custom-tailored to exclude allergens, respect diet preferences, or handle past history).
2. Maintain a highly professional, encouraging, yet medically cautious coaching tone.
3. Strongly emphasize consulting a healthcare professional if symptoms are severe, include warning signs, or do not improve.
4. Add a clear medical disclaimer at the bottom stating you are an AI assistant and this is educational, not professional medical advice.
"""
        response = model.generate_content(prompt)
        return response.text

    def _explain_food(self, food: str, disease: str) -> str:
        """Simple rule-based explanation of why a food is recommended."""
        food_l = food.lower()
        dis_l = disease.lower()
        if "porridge" in food_l or "toast" in food_l or "cracker" in food_l or "rice" in food_l:
            return "Easy to digest starches that do not strain your gastrointestinal tract"
        elif "broth" in food_l or "soup" in food_l:
            return "Provides comforting warmth, sodium, and hydration to thin mucus"
        elif "banana" in food_l:
            return "Rich in potassium, soft, and easy to digest to help replenish minerals"
        elif "honey" in food_l:
            return "Coats the throat and helps suppress cough fits"
        elif "ginger" in food_l or "turmeric" in food_l:
            return "Contains natural anti-inflammatory components that soothe irritation"
        elif "orange" in food_l or "citrus" in food_l or "berry" in food_l:
            return "Provides essential Vitamin C to support your immune system"
        elif "yogurt" in food_l or "greek yogurt" in food_l:
            return "Contains probiotics to support gut health and is soft to ingest"
        elif "watermelon" in food_l or "cucumber" in food_l:
            return "Extremely high water content to assist with cellular rehydration"
        elif "spinach" in food_l or "almond" in food_l:
            return "Rich in magnesium and nutrients to ease tension and headache symptoms"
        else:
            return "Nutrient-dense recovery food option that is generally well-tolerated"
