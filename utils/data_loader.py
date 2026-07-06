import os
import json
from typing import Any, Dict, List
from models.schema import (
    DiseaseInformationList, FoodRecommendationsMap, ExerciseRecommendationsMap,
    RecoveryTipsMap, MedicinePrecautionsMap, EmergencySymptomsMap,
    NutritionDataMap, SymptomMapping, LifestyleRecommendationsMap,
    UserHistory, HealthRecord
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# File maps and their Pydantic validator models
FILE_SCHEMAS = {
    "disease_information.json": DiseaseInformationList,
    "food_recommendations.json": FoodRecommendationsMap,
    "exercise_recommendations.json": ExerciseRecommendationsMap,
    "recovery_tips.json": RecoveryTipsMap,
    "medicine_precautions.json": MedicinePrecautionsMap,
    "emergency_symptoms.json": EmergencySymptomsMap,
    "nutrition_data.json": NutritionDataMap,
    "symptom_mapping.json": SymptomMapping,
    "lifestyle_recommendations.json": LifestyleRecommendationsMap,
    "user_history.json": UserHistory,
    "health_records.json": HealthRecord,
}

# --- DEFAULT DATA DEFINITIONS ---
DEFAULT_DISEASES = {
    "diseases": [
        {
            "disease_name": "Fever",
            "symptoms": ["high body temperature", "chills", "sweating", "headache", "muscle aches", "fatigue"],
            "description": "An elevation in body temperature above the normal range (98.6°F or 37°C), usually in response to an infection.",
            "severity": "moderate"
        },
        {
            "disease_name": "Cold",
            "symptoms": ["runny nose", "sneezing", "sore throat", "mild cough", "nasal congestion", "watery eyes", "low grade fever"],
            "description": "A mild viral infection of the nose, throat, sinuses, and upper airways, very common and self-limiting.",
            "severity": "mild"
        },
        {
            "disease_name": "Flu",
            "symptoms": ["sudden high fever", "severe body aches", "dry cough", "extreme fatigue", "headache", "sore throat", "chills"],
            "description": "A highly contagious viral infection of the respiratory tract, causing more severe symptoms than a common cold.",
            "severity": "moderate"
        },
        {
            "disease_name": "Cough",
            "symptoms": ["coughing", "throat tickle", "dry throat", "mucus build up", "chest discomfort"],
            "description": "A reflex action to clear your airways of mucus and irritants. Can be dry (tickly) or chesty (productive).",
            "severity": "mild"
        },
        {
            "disease_name": "Sore Throat",
            "symptoms": ["painful swallowing", "scratchy throat", "redness in throat", "swollen glands in neck"],
            "description": "Pain, itchiness, or irritation of the throat that often worsens when you swallow. Usually viral, sometimes bacterial.",
            "severity": "mild"
        },
        {
            "disease_name": "Headache",
            "symptoms": ["head pain", "throbbing pain", "temple pain", "neck stiffness", "light sensitivity"],
            "description": "Pain in any region of the head. Can be tension-type, migraine, or sinus-related.",
            "severity": "mild"
        },
        {
            "disease_name": "Diarrhea",
            "symptoms": ["loose stools", "watery stools", "abdominal cramps", "bloating", "nausea", "urgency"],
            "description": "Passing loose or watery stools three or more times a day, leading to rapid fluid and electrolyte loss.",
            "severity": "moderate"
        },
        {
            "disease_name": "Constipation",
            "symptoms": ["hard stools", "infrequent bowel movements", "straining", "abdominal bloating", "feeling of blockage"],
            "description": "Difficulty in passing stools or bowel movements occurring less frequently than normal.",
            "severity": "mild"
        },
        {
            "disease_name": "Food Poisoning",
            "symptoms": ["nausea", "vomiting", "watery diarrhea", "stomach cramps", "fever", "weakness"],
            "description": "An illness caused by consuming food contaminated with bacteria, viruses, parasites, or toxins.",
            "severity": "moderate"
        },
        {
            "disease_name": "Dehydration",
            "symptoms": ["extreme thirst", "dry mouth", "dark yellow urine", "dizziness", "fatigue", "dry skin"],
            "description": "A harmful reduction in the amount of water in the body, requiring immediate replenishment of fluids and electrolytes.",
            "severity": "moderate"
        },
        {
            "disease_name": "Seasonal Allergies",
            "symptoms": ["sneezing", "runny nose", "itchy eyes", "watery eyes", "congestion", "throat irritation"],
            "description": "An allergic reaction to airborne substances like pollen from trees, grass, or weeds, occurring seasonally.",
            "severity": "mild"
        }
    ]
}

DEFAULT_FOOD_RECS = {
    "recommendations": {
        "Fever": {
            "recommended": ["Rice porridge (Kanji)", "Clear chicken or vegetable broth", "Steamed Idli", "Ripe bananas", "Applesauce", "Greek yogurt"],
            "avoid": ["Fried chicken", "Oily curries", "Alcoholic beverages", "Coffee and tea", "Highly processed fast foods"]
        },
        "Cold": {
            "recommended": ["Chicken noodle soup", "Garlic infused broth", "Ginger tea with honey", "Oranges and citrus fruits", "Strawberries", "Warm oatmeal"],
            "avoid": ["Ice cream", "Chilled sodas", "Deep-fried snacks", "Excess dairy products (if they thicken mucus)"]
        },
        "Flu": {
            "recommended": ["Bone broth", "Scrambled eggs", "Steamed vegetables", "Plain oatmeal", "Mashed sweet potatoes", "Soft toast"],
            "avoid": ["Heavy greasy foods", "Spicy peppers", "Carbonated energy drinks", "Alcohol", "Hard/crunchy snacks that irritate throat"]
        },
        "Cough": {
            "recommended": ["Warm ginger tea with raw honey", "Pineapple slices (contains bromelain)", "Warm soups", "Baked pears", "Licorice root tea"],
            "avoid": ["Dry crackers", "Crisps/chips", "Spicy food", "Ice cold water", "Sugary sodas"]
        },
        "Sore Throat": {
            "recommended": ["Warm vegetable broth", "Mashed potatoes", "Yogurt", "Scrambled eggs", "Smoothies (non-acidic)", "Oatmeal with honey"],
            "avoid": ["Potato chips", "Dry toast", "Citrus juices (orange, lemon - can sting)", "Spicy food", "Very hot liquids"]
        },
        "Headache": {
            "recommended": ["Watermelon", "Cucumber slices", "Almonds and walnuts", "Spinach", "Bananas (magnesium-rich)", "Whole grain toast"],
            "avoid": ["Aged cheese (tyramine)", "Processed meats (cured with nitrates)", "Chocolate", "Artificial sweeteners", "Red wine"]
        },
        "Diarrhea": {
            "recommended": ["BRAT Diet: Bananas, white Rice, Applesauce, white Toast", "Boiled potatoes", "Saltine crackers", "Plain oatmeal"],
            "avoid": ["Whole milk and cheese", "Fried foods", "Beans and broccoli (gas-forming)", "Prunes and plums", "Sugar-free gum (contains sorbitol)"]
        },
        "Constipation": {
            "recommended": ["Prunes and prune juice", "High-fiber apples and pears", "Chia seeds and flaxseeds", "Broccoli and brussels sprouts", "Beans and lentils"],
            "avoid": ["White bread and white rice", "Processed meats", "Unripe green bananas", "Excessive cheese", "Fast food chips"]
        },
        "Food Poisoning": {
            "recommended": ["Plain saltine crackers", "Dry white toast", "White rice", "Applesauce", "Bananas", "Plain boiled chicken (when stomach settles)"],
            "avoid": ["Spicy food", "Greasy fast food", "Dairy products", "Caffeine", "Alcoholic beverages"]
        },
        "Dehydration": {
            "recommended": ["Watermelon", "Cucumbers", "Strawberries", "Celery sticks", "Tomatoes", "Oranges"],
            "avoid": ["Salty potato chips", "Cured bacon and meats", "Strong black coffee", "Energy drinks", "Sugary soda drinks"]
        },
        "Seasonal Allergies": {
            "recommended": ["Local organic honey", "Ginger and turmeric dishes", "Berries and citrus fruits", "Fatty fish (salmon, mackerel for Omega-3)", "Onions (quercetin-rich)"],
            "avoid": ["Excess dairy (thickens mucus)", "Processed seed oils", "Alcohol", "High-sugar treats"]
        }
    }
}

DEFAULT_EXERCISE_RECS = {
    "recommendations": {
        "Fever": {
            "recommended": ["None - prioritised rest", "Very light passive stretching in bed once fever breaks"],
            "avoid": ["All forms of physical exercise", "Weightlifting", "Cardio training", "Outdoor walks in cold/hot weather"],
            "notes": "Exercising with a fever raises core body temperature to dangerous levels and risks severe illness or myocarditis. Rest completely."
        },
        "Cold": {
            "recommended": ["Light walking", "Gentle hatha yoga", "Light mobility exercises", "Easy cycling"],
            "avoid": ["Heavy weightlifting", "High intensity interval training (HIIT)", "Long endurance runs", "Team sports"],
            "notes": "Follow the 'Above the Neck' rule. If symptoms are above the neck (runny nose, sneezing), light exercise is safe. If you feel body aches or chest congestion, rest."
        },
        "Flu": {
            "recommended": ["None - complete physical rest", "Simple breathing exercises"],
            "avoid": ["All running and walking", "Strength training", "Stretching that causes strain", "Gym visits (prevents spreading)"],
            "notes": "Flu impacts the entire body system. Do not exercise. Return to light activity only after being symptom-free for at least 48 hours."
        },
        "Cough": {
            "recommended": ["Gentle indoor walking", "Low-intensity mobility work", "Tai Chi"],
            "avoid": ["High-impact running (triggers coughing fits)", "Cold outdoor workouts", "Heavy cardiovascular training"],
            "notes": "If the cough is chesty, productive, or accompanied by wheezing, avoid workouts. Ensure warm humid environment for any mild movement."
        },
        "Sore Throat": {
            "recommended": ["Walking at moderate pace", "Light flexibility stretching", "Gentle yoga"],
            "avoid": ["Intense heavy breathing workouts", "Cardio that dries the throat", "Swimming in chlorinated pools (irritates airway)"],
            "notes": "Light physical activity is fine if you have energy and no fever. Drink water frequently to keep throat hydrated."
        },
        "Headache": {
            "recommended": ["Neck and shoulder stretches", "Gentle yoga (avoid inversions)", "Quiet walking in fresh air"],
            "avoid": ["Heavy deadlifts/squats (increases cranial pressure)", "High-impact jumping/running", "Workouts with loud music/bright lights"],
            "notes": "Light stretching helps if the headache is caused by neck tension. Avoid rapid head movements or heavy straining."
        },
        "Diarrhea": {
            "recommended": ["None during acute phase", "Very light restorative yoga once recovering", "Short slow walk"],
            "avoid": ["Running and jogging (creates bowel friction)", "Abdominal core exercises", "Heavy lifting", "Long workouts"],
            "notes": "Dehydration risk is very high. Avoid sweating or heavy physical exertion. Keep workouts very short and keep water/electrolytes nearby."
        },
        "Constipation": {
            "recommended": ["Brisk walking", "Jogging or running", "Abdominal twists and pelvic stretches", "Swimming", "Jump rope"],
            "avoid": ["Prolonged sitting exercises (stationary cycling for hours)", "None - physical activity is highly recommended"],
            "notes": "Exercise stimulates the natural contractions of your bowel muscles. Staying active is one of the best ways to relieve constipation."
        },
        "Food Poisoning": {
            "recommended": ["Complete bed rest", "Very gentle stretching after symptoms break"],
            "avoid": ["All gym workouts", "Any activity that induces sweating", "Bending/twisting movements"],
            "notes": "Your body has lost fluids and energy. Exercise is dangerous. Allow your stomach and hydration levels to fully normalize first."
        },
        "Dehydration": {
            "recommended": ["None - sit or lie down in a cool shaded room", "Gentle leg elevation"],
            "avoid": ["All physical exertion", "Sweating in hot environments", "Standing for long periods"],
            "notes": "Exercising while dehydrated can cause heat exhaustion, heat stroke, fainting, and severe muscle cramping. Rehydrate and rest."
        },
        "Seasonal Allergies": {
            "recommended": ["Indoor gym workouts", "Swimming in indoor pools", "Indoor yoga and Pilates", "Evening walks (pollen is lower)"],
            "avoid": ["Early morning outdoor running (peak pollen time)", "Workouts near cut grass or blooming flowers", "High-intensity outdoor training"],
            "notes": "Work out indoors when pollen counts are high. Wash your body and clothes immediately after being outside."
        }
    }
}

DEFAULT_RECOVERY_TIPS = {
    "recommendations": {
        "Fever": {
            "tips": ["Place a cool, damp washcloth on your forehead or the back of your neck", "Keep room temperature comfortable (around 70°F or 21°C)", "Wear lightweight clothing and use a light blanket", "Avoid cold baths or ice, as they cause shivering which raises core temperature", "Sleep as much as possible to let the immune system work"]
        },
        "Cold": {
            "tips": ["Perform steam inhalation twice a day using warm water", "Gargle with warm salt water (1/2 tsp salt in 1 cup warm water) to relieve sore throat", "Use nasal saline drops or a neti pot to clear nasal blockages", "Apply a warm compress over sinuses to relieve facial pressure", "Use a humidifier in your bedroom at night"]
        },
        "Flu": {
            "tips": ["Stay home and isolate from family members to prevent spread", "Prioritize strict bed rest; limit physical chores", "Take a warm, steamy shower to clear congestion and soothe body aches", "Use extra pillows to elevate your head for easier breathing", "Monitor temperature and oxygen levels regularly"]
        },
        "Cough": {
            "tips": ["Take a teaspoon of honey before bed to coat the throat (do not give to infants under 1 year)", "Sip warm liquids continuously to soothe the raw throat lining", "Inhale steam or use a cool-mist vaporizer", "Avoid exposure to tobacco smoke, dust, and chemical fumes", "Elevate head with pillows at night to reduce post-nasal drip coughing"]
        },
        "Sore Throat": {
            "tips": ["Gargle warm salt water every 2-3 hours", "Rest your voice - avoid shouting or prolonged talking", "Suckle on throat lozenges or hard candies to stimulate saliva flow", "Wrap a warm scarf or compress around your neck", "Avoid dry indoor air by using a humidifier"]
        },
        "Headache": {
            "tips": ["Rest in a dark, quiet room with your eyes closed", "Apply a cold compress or ice pack wrapped in a cloth to your forehead or temples", "Gently massage your neck, shoulders, and temples", "Practice deep breathing or progressive muscle relaxation", "Reduce screen time from phones, computers, and TV immediately"]
        },
        "Diarrhea": {
            "tips": ["Eat small, frequent, bland meals instead of three large meals", "Rest physically to prevent abdominal cramping", "Maintain strict hand hygiene to avoid spreading viral infections", "Avoid tight clothing around the abdomen", "Do not take anti-diarrheal medication without doctor consultation if fever or blood is present"]
        },
        "Constipation": {
            "tips": ["Try to establish a regular time for bowel movements, such as after breakfast", "Never ignore or delay the urge to pass stool", "Drink a glass of warm water first thing in the morning", "Gently massage the lower abdomen in a clockwise direction to stimulate movement", "Review if any recent medications or supplements (like iron) are causing it"]
        },
        "Food Poisoning": {
            "tips": ["Let your stomach settle; avoid solid foods for the first few hours of active vomiting", "Sip very small amounts of fluids frequently, even if you can only manage a tablespoon at a time", "Lie down on your side so you do not choke if vomiting occurs suddenly", "Avoid taking anti-diarrheal medicines as they may keep toxins in your body", "Gradually introduce bland foods once vomiting has ceased for 6+ hours"]
        },
        "Dehydration": {
            "tips": ["Sip water or ORS slowly in small volumes (gulping large amounts can trigger vomiting)", "Move to a cool, air-conditioned, or well-ventilated space", "Remove excess clothing to assist cooling down", "Lie down with feet slightly elevated to promote blood flow to the brain", "Keep tracking urine color - it should clear to a light yellow color"]
        },
        "Seasonal Allergies": {
            "tips": ["Keep all windows closed during high pollen days; use air conditioning instead", "Take a shower and wash your hair after spending time outdoors to remove pollen", "Dry your clothes indoors rather than on an outdoor line where pollen sticks", "Wear sunglasses outdoors to protect your eyes from airborne pollen", "Use a nasal saline rinse daily to wash out allergen particles"]
        }
    }
}

DEFAULT_MEDICINE_PRECAUTIONS = {
    "recommendations": {
        "Fever": {
            "medications": ["Acetaminophen (Paracetamol)", "Ibuprofen"],
            "precautions": ["Do not exceed 4000mg of Acetaminophen in 24 hours to avoid liver damage", "Avoid Ibuprofen on an empty stomach to prevent gastric irritation", "Never give Aspirin to children or teenagers due to the risk of Reye's syndrome", "Consult a doctor if taking other multi-symptom cold meds to avoid double dosing"]
        },
        "Cold": {
            "medications": ["Decongestants (Pseudoephedrine)", "Antihistamines", "Saline Nasal Sprays"],
            "precautions": ["Avoid using nasal decongestant sprays for more than 3-5 consecutive days to prevent rebound congestion", "Be aware that first-generation antihistamines cause drowsiness; do not drive", "Pseudoephedrine can increase blood pressure and heart rate; consult doctor if hypertensive"]
        },
        "Flu": {
            "medications": ["Antiviral drugs (Oseltamivir/Tamiflu - prescription)", "Acetaminophen", "Ibuprofen"],
            "precautions": ["Antivirals are most effective when started within 48 hours of symptom onset", "Avoid taking multiple NSAIDs (like Ibuprofen and Naproxen) together", "Ensure proper liver and kidney checks if taking prescription medications"]
        },
        "Cough": {
            "medications": ["Expectorants (Guaifenesin)", "Suppressants (Dextromethorphan)", "Throat lozenges"],
            "precautions": ["Use expectorants for wet, productive coughs to thin mucus, not suppressants", "Use suppressants for dry, tickly coughs that prevent sleep", "Do not give over-the-counter cough medicines to children under 4-6 years without doctor approval"]
        },
        "Sore Throat": {
            "medications": ["Anesthetic lozenges (containing benzocaine or menthol)", "Acetaminophen", "Warm saltwater gargle"],
            "precautions": ["Anesthetic lozenges numb the throat; avoid hot foods immediately after use to prevent burns", "If a sore throat is bacterial (Strep throat), antibiotics are required; complete the entire course", "Do not use throat sprays containing phenol frequently or for more than 2 days"]
        },
        "Headache": {
            "medications": ["Aspirin", "Ibuprofen", "Acetaminophen", "Combination pain relievers (with Caffeine)"],
            "precautions": ["Limit use of pain relief medications to 2-3 days per week to avoid medication overuse (rebound) headaches", "Caffeine helps absorb pain relievers but can trigger withdrawal headaches if stopped suddenly", "Do not drink alcohol while taking Acetaminophen (increases liver toxicity)"]
        },
        "Diarrhea": {
            "medications": ["Loperamide (Imodium)", "Bismuth Subsalicylate (Pepto-Bismol)"],
            "precautions": ["Do not use anti-diarrheals if you have a high fever, severe abdominal pain, or bloody stools (indicates bacterial/parasitic infection)", "Bismuth subsalicylate can turn your tongue or stool black, which is harmless", "Loperamide should be discontinued if symptoms worsen or last more than 48 hours"]
        },
        "Constipation": {
            "medications": ["Bulk-forming laxatives (Psyllium)", "Osmotic laxatives (Polyethylene glycol/Miralax)", "Stimulant laxatives (Senna)"],
            "precautions": ["Always drink a full glass of water with bulk-forming laxatives to prevent bowel obstruction", "Limit the use of stimulant laxatives to avoid dependency and lazy bowel syndrome", "Consult a doctor if constipation persists for more than 7 days despite laxative use"]
        },
        "Food Poisoning": {
            "medications": ["Oral Rehydration Salts (ORS)", "Anti-nausea medication (prescription)"],
            "precautions": ["Avoid taking anti-diarrheal medications immediately; the body needs to expel the bacteria/toxins", "Do not force food; focus entirely on keeping hydrated with ORS", "Consult a physician before taking antibiotics as they are useless against viral or toxin-mediated poisoning"]
        },
        "Dehydration": {
            "medications": ["Oral Rehydration Salts (ORS)", "Intravenous (IV) fluids (emergency only)"],
            "precautions": ["ORS should be mixed precisely as instructed on the packet; do not add extra sugar or salt", "Avoid sports drinks as your primary hydration source if they contain excessive sugar (which can worsen diarrhea)", "Seek immediate IV fluid therapy in a clinical setting if vomiting prevents oral fluid intake"]
        },
        "Seasonal Allergies": {
            "medications": ["Nonsedating antihistamines (Loratadine, Cetirizine)", "Nasal corticosteroid sprays (Fluticasone)"],
            "precautions": ["Nasal corticosteroid sprays must be used daily for optimal effectiveness, not just on-demand", "Spray nasal medications away from the nasal septum (center wall) to avoid irritation or bleeding", "Be cautious with allergy medications containing decongestants (labeled -D) due to blood pressure risks"]
        }
    }
}

DEFAULT_EMERGENCY_SYMPTOMS = {
    "recommendations": {
        "Fever": {
            "warning_signs": ["Difficulty breathing or chest pain", "Persistent fever above 103°F (39.4°C) that does not respond to medication", "Stiff neck and severe headache", "Confusion, lethargy, or difficulty waking up", "Seizures or convulsions"],
            "emergency_contact": "911 or call nearest emergency response team immediately"
        },
        "Cold": {
            "warning_signs": ["Shortness of breath or difficulty breathing", "High fever or chest tightness", "Inability to keep liquids down", "Symptoms worsening significantly after 7-10 days"],
            "emergency_contact": "Consult your primary care physician or visit urgent care"
        },
        "Flu": {
            "warning_signs": ["Difficulty breathing or shortness of breath", "Persistent pain or pressure in the chest or abdomen", "Sudden dizziness, confusion, or inability to arouse", "Severe muscle pain or weakness", "Fever and cough that improve but then return and worsen"],
            "emergency_contact": "Go to the nearest emergency department or call 911"
        },
        "Cough": {
            "warning_signs": ["Coughing up blood or pink-tinged mucus", "Difficulty breathing, swallowing, or talking", "Wheezing or a high-pitched sound when inhaling (stridor)", "Severe chest pain when coughing", "Cough lasting more than 3-4 weeks"],
            "emergency_contact": "Schedule an urgent doctor visit or go to emergency room if breathing is compromised"
        },
        "Sore Throat": {
            "warning_signs": ["Difficulty breathing or swallowing", "Inability to open your mouth fully (trismus)", "Drooling or muffled 'hot potato' voice", "A new rash or stiff neck", "Blood in saliva or phlegm"],
            "emergency_contact": "Seek immediate emergency medical attention"
        },
        "Headache": {
            "warning_signs": ["Sudden, extremely severe pain ('thunderclap' headache)", "Headache accompanied by fever, stiff neck, confusion, or seizures", "Headache with double vision, numbness, weakness, or speech difficulty", "Headache following a recent head injury", "A new type of headache if you are over 50 years old"],
            "emergency_contact": "Call 911 or visit the emergency room immediately"
        },
        "Diarrhea": {
            "warning_signs": ["Signs of severe dehydration (no urination, sunken eyes, dry mouth, confusion)", "Stools that are black, tarry, or contain visible blood", "Severe, constant abdominal pain", "High fever (above 102°F)", "Diarrhea lasting more than 2 days in adults"],
            "emergency_contact": "Contact your healthcare provider or seek urgent care"
        },
        "Constipation": {
            "warning_signs": ["Severe, constant abdominal pain", "Blood in the stool or bleeding from the rectum", "Inability to pass gas (indicates possible bowel obstruction)", "Unexplained weight loss", "Constipation accompanied by vomiting and fever"],
            "emergency_contact": "Contact a doctor immediately or visit urgent care"
        },
        "Food Poisoning": {
            "warning_signs": ["Frequent episodes of vomiting and inability to keep any liquids down for 12+ hours", "Bloody vomit or stools", "Extreme abdominal cramps or pain", "High fever (oral temperature above 102°F)", "Neurological symptoms such as blurry vision, muscle weakness, or tingling"],
            "emergency_contact": "Visit the nearest emergency clinic or contact your physician"
        },
        "Dehydration": {
            "warning_signs": ["Extreme lethargy, confusion, irritability, or delirium", "Inability to urinate for 8 hours, or very dark amber urine", "Fainting, dizziness upon standing, or low blood pressure", "Rapid heart rate and shallow rapid breathing", "Sunken eyes and lack of tears when crying"],
            "emergency_contact": "Go to the emergency room immediately for intravenous fluid replacement"
        },
        "Seasonal Allergies": {
            "warning_signs": ["Sudden difficulty breathing or throat swelling (anaphylaxis)", "Wheezing, chest tightness, or persistent cough", "Hives, swelling of the lips, tongue, or face", "Dizziness or fainting"],
            "emergency_contact": "Administer epinephrine auto-injector if available and call 911 immediately"
        }
    }
}

DEFAULT_NUTRITION_DATA = {
    "recommendations": {
        "Fever": {
            "hydration_advice": "Drink at least 2.5 to 3 liters of fluids daily. Water, diluted juices, warm broths, and decaffeinated herbal teas are best. Avoid dehydration.",
            "caloric_recommendation": "Caloric needs increase during a fever (approx. 7% per 1°F rise). Focus on energy-dense, easy-to-digest carbs like porridge, bananas, and crackers.",
            "electrolytes": "Incorporate coconut water, broths, and oral rehydration solutions to balance lost salts from sweating."
        },
        "Cold": {
            "hydration_advice": "Hydrate frequently to thin out mucus. Warm drinks like lemon water, herbal teas, and hot broths soothe the throat.",
            "caloric_recommendation": "Maintain normal caloric intake. Focus on foods rich in Vitamin C, zinc, and antioxidants (citrus, berries, garlic).",
            "electrolytes": "Warm vegetable or chicken soups provide sodium, potassium, and chloride to sustain cell hydration."
        },
        "Flu": {
            "hydration_advice": "Prioritize fluid intake above solids. Sip warm water, broths, and herbal teas. Aim for 2.5+ liters.",
            "caloric_recommendation": "Do not force yourself to eat if appetite is low. When eating, select small amounts of bland, protein-rich foods like scrambled eggs.",
            "electrolytes": "ORS or electrolyte packets in water are highly recommended to offset mineral depletion from sweating and fever."
        },
        "Cough": {
            "hydration_advice": "Warm fluids are essential. Honey in warm water or tea creates a protective layer over the throat receptors, suppressing cough.",
            "caloric_recommendation": "Eat soft, nutrient-dense foods (smooth soups, oatmeal) that do not scratch or irritate the throat lining.",
            "electrolytes": "Broths and coconut water are excellent for fluid balancing."
        },
        "Sore Throat": {
            "hydration_advice": "Drink lukewarm or cool liquids, whichever feels better. Avoid highly acidic drinks (like orange juice) which sting the raw throat.",
            "caloric_recommendation": "Opt for soft, high-calorie, high-protein foods like yogurt, custard, scrambled eggs, and smoothies to maintain strength.",
            "electrolytes": "Diluted apple juice or warm broth provides hydration and electrolytes without stinging."
        },
        "Headache": {
            "hydration_advice": "Dehydration is a leading trigger of headaches. Drink 500ml of water immediately when a headache starts, then sip steadily.",
            "caloric_recommendation": "Eat magnesium-rich foods (nuts, seeds, leafy greens) to help relax blood vessels. Avoid skipping meals, as low blood sugar triggers headaches.",
            "electrolytes": "An electrolyte-infused drink can quickly restore fluid balance and ease tension-related headache symptoms."
        },
        "Diarrhea": {
            "hydration_advice": "Crucial: Plain water alone is not enough. Drink ORS, diluted fruit juices, and clear broths. Sip continuously.",
            "caloric_recommendation": "Follow the BRAT diet. Avoid fiber, sugar, and fat. Eat small portions of rice, bananas, and toast to absorb water in the gut.",
            "electrolytes": "Oral Rehydration Salts (ORS) contain the precise ratio of sodium, potassium, and glucose to maximize gut fluid absorption."
        },
        "Constipation": {
            "hydration_advice": "Drink at least 3 liters of water daily. Water softens the stool, making it easier to pass. Warm water in the morning stimulates bowel motility.",
            "caloric_recommendation": "Increase daily fiber intake to 25-30g. Eat prunes, whole grains, and raw vegetables. Increase fiber gradually to prevent gas.",
            "electrolytes": "Ensure adequate magnesium intake (found in nuts, seeds, leafy greens) as it acts as a mild osmotic laxative."
        },
        "Food Poisoning": {
            "hydration_advice": "Do not drink large quantities of water at once as it triggers vomiting. Sip ORS or electrolyte drinks (1-2 tablespoons every 10-15 minutes).",
            "caloric_recommendation": "Avoid solid foods entirely until vomiting stops. Once ready, start with very small amounts of bland, low-fat starches (crackers, rice).",
            "electrolytes": "ORS is mandatory to replace critical sodium, potassium, and chloride lost from vomiting and diarrhea."
        },
        "Dehydration": {
            "hydration_advice": "Rehydrate immediately. Sip ORS, coconut water, or water with electrolyte tablets. Drink slowly.",
            "caloric_recommendation": "Focus on high-water-content fruits (watermelon, strawberries, oranges) rather than dry solid foods.",
            "electrolytes": "Electrolytes are essential. Gulping plain water in massive quantities can dilute blood sodium levels (hyponatremia), which is dangerous."
        },
        "Seasonal Allergies": {
            "hydration_advice": "Drink plenty of water to help thin out thick mucus and flush out allergens.",
            "caloric_recommendation": "Incorporate anti-inflammatory foods (fatty fish, walnuts, turmeric) to reduce allergy symptoms. Maintain a balanced calorie level.",
            "electrolytes": "Standard dietary intake of minerals via fruits and vegetables is sufficient."
        }
    }
}

DEFAULT_SYMPTOM_MAPPING = {
    "mapping": {
        "fever": ["Fever", "Flu", "Food Poisoning", "Cold"],
        "high body temperature": ["Fever"],
        "chills": ["Fever", "Flu"],
        "sweating": ["Fever", "Dehydration"],
        "headache": ["Fever", "Flu", "Headache", "Dehydration"],
        "head pain": ["Headache"],
        "throbbing pain": ["Headache"],
        "temple pain": ["Headache"],
        "muscle aches": ["Fever", "Flu"],
        "body aches": ["Flu", "Cold"],
        "fatigue": ["Fever", "Flu", "Cold", "Dehydration"],
        "weakness": ["Food Poisoning", "Dehydration"],
        "runny nose": ["Cold", "Seasonal Allergies"],
        "sneezing": ["Cold", "Seasonal Allergies"],
        "sore throat": ["Cold", "Flu", "Sore Throat"],
        "painful swallowing": ["Sore Throat", "Cold"],
        "scratchy throat": ["Sore Throat", "Cold", "Seasonal Allergies"],
        "swollen glands": ["Sore Throat"],
        "coughing": ["Cough", "Cold", "Flu"],
        "cough": ["Cough", "Cold", "Flu"],
        "dry cough": ["Flu", "Cough"],
        "mild cough": ["Cold"],
        "congestion": ["Cold", "Seasonal Allergies"],
        "nasal congestion": ["Cold"],
        "watery eyes": ["Cold", "Seasonal Allergies"],
        "itchy eyes": ["Seasonal Allergies"],
        "loose stools": ["Diarrhea", "Food Poisoning"],
        "watery stools": ["Diarrhea", "Food Poisoning"],
        "abdominal cramps": ["Diarrhea", "Food Poisoning"],
        "stomach cramps": ["Food Poisoning", "Diarrhea"],
        "bloating": ["Diarrhea", "Constipation"],
        "nausea": ["Diarrhea", "Food Poisoning"],
        "vomiting": ["Food Poisoning"],
        "hard stools": ["Constipation"],
        "infrequent bowel movements": ["Constipation"],
        "straining": ["Constipation"],
        "extreme thirst": ["Dehydration"],
        "dry mouth": ["Dehydration"],
        "dark yellow urine": ["Dehydration"],
        "dark urine": ["Dehydration"],
        "dizziness": ["Dehydration", "Headache"],
        "dry skin": ["Dehydration"]
    }
}

DEFAULT_LIFESTYLE_RECS = {
    "recommendations": {
        "Fever": {
            "sleep_recommendation": "Aim for 9-10 hours of sleep. Take daytime naps as needed. Sleep helps the immune system fight infections.",
            "hygiene_recommendation": "Wash hands frequently. Sponge bathe with lukewarm water; do not use cold water. Change sweat-soaked bedding and clothes daily.",
            "stress_management": "Avoid work, screen time, and mental exhaustion. Keep the environment quiet and dark to avoid triggering headaches."
        },
        "Cold": {
            "sleep_recommendation": "Get 8 hours of sleep. Elevate your head slightly with extra pillows to prevent nasal congestion from blocking your sleep.",
            "hygiene_recommendation": "Use tissues when coughing/sneezing and discard immediately. Wash hands with soap for 20 seconds. Disinfect frequently touched items.",
            "stress_management": "Practice gentle breathing and keep warm. Light reading or relaxing music can help pass time without raising stress."
        },
        "Flu": {
            "sleep_recommendation": "Strict bed rest. Get at least 9-10 hours of sleep. Avoid physical tasks around the house.",
            "hygiene_recommendation": "Isolate in a separate room if possible. Wash hands, wear a mask if interacting with family, and use separate utensils.",
            "stress_management": "Disconnect entirely from work. Focus on resting. Mental stress can prolong recovery time."
        },
        "Cough": {
            "sleep_recommendation": "8 hours of sleep. Use a humidifier in your bedroom to keep airways moist. Elevating your head prevents nighttime coughing fits.",
            "hygiene_recommendation": "Cover mouth when coughing (use elbow, not hand). Wash hands frequently.",
            "stress_management": "Avoid inhaling dry air, smoke, or strong chemical sprays. Stay in calm, humidified rooms."
        },
        "Sore Throat": {
            "sleep_recommendation": "8 hours of sleep. Rest your vocal cords as much as possible; avoid talking.",
            "hygiene_recommendation": "Wash glasses and cups thoroughly. Replace your toothbrush once you recover to prevent reinfection.",
            "stress_management": "Sip warm liquids to soothe stress. Take warm steamy baths to relax throat muscles."
        },
        "Headache": {
            "sleep_recommendation": "Aim for a consistent 7-8 hours. Avoid oversleeping or sleeping too little, as both can trigger headaches.",
            "hygiene_recommendation": "Keep lighting dim and noise levels low. Take a warm shower to relax neck and shoulder muscles.",
            "stress_management": "Avoid screens and bright lights. Do progressive muscle relaxation, meditation, or spend time in a quiet dark room."
        },
        "Diarrhea": {
            "sleep_recommendation": "Ensure 8 hours of rest. Dehydration and gut repair require significant metabolic energy.",
            "hygiene_recommendation": "Wash hands thoroughly with soap after every restroom visit. Disinfect restroom surfaces daily to prevent viral spread.",
            "stress_management": "Stress can accelerate bowel motility. Rest quietly, use warm compresses on the stomach to soothe cramps."
        },
        "Constipation": {
            "sleep_recommendation": "7-8 hours of sleep. A regular sleep schedule helps maintain a regular circadian rhythm, which coordinates bowel movements.",
            "hygiene_recommendation": "Respond immediately to urges to defecate. Take your time, avoiding heavy straining. Gentle walking post-meals is helpful.",
            "stress_management": "High stress releases hormones that slow digestion. Practice relaxation, deep breathing, and belly-massages."
        },
        "Food Poisoning": {
            "sleep_recommendation": "Rest in bed as much as possible. Sleep supports cellular repair and helps your body flush out toxins.",
            "hygiene_recommendation": "Wash hands with soap and water after vomiting or using the restroom. Disinfect bedding and clothing if soiled.",
            "stress_management": "Allow yourself to sleep. Keep stress low by keeping work on hold until hydration levels are normal."
        },
        "Dehydration": {
            "sleep_recommendation": "Rest completely. Lie down in a cool, ventilated room. Sleep helps stabilize blood pressure and heart rate.",
            "hygiene_recommendation": "Avoid exposing skin to direct hot sunlight. Stay in cool shade. Sponge body with cool water if feeling hot.",
            "stress_management": "Dehydration increases cortisol (stress hormone). Rest quietly and focus on slow hydration to keep heart rate stable."
        },
        "Seasonal Allergies": {
            "sleep_recommendation": "8 hours of sleep. Keep windows closed during sleep. Use an air purifier in the bedroom.",
            "hygiene_recommendation": "Shower and wash hair immediately upon returning home. Disinfect outdoor jackets. Wash bedding weekly in hot water.",
            "stress_management": "High stress worsens immune responses. Practice meditation, deep breathing, and reduce strenuous outdoor duties."
        }
    }
}

DEFAULT_USER_HISTORY = {
    "user_id": "default",
    "history": [
        {
            "date": "2026-07-05",
            "symptoms": ["fever", "headache"],
            "recommendations": {
                "food": ["Rice porridge (Kanji)", "Clear chicken or vegetable broth"],
                "exercise": ["None - prioritised rest", "Very light passive stretching in bed once fever breaks"]
            }
        }
    ]
}

DEFAULT_HEALTH_RECORD = {
    "age": 28,
    "height": 178.0,
    "weight": 74.5,
    "allergies": ["penicillin", "peanuts"],
    "chronic_diseases": ["asthma"],
    "medications": ["albuterol inhaler (as needed)"],
    "previous_illnesses": ["seasonal flu", "cold"],
    "food_preferences": ["none"],
    "exercise_level": "moderate",
    "sleep_habits": "7-8 hours"
}


# --- LOADER FUNCTIONS ---

def initialize_all_datasets():
    """Create dataset directory and all JSON files with default data if they don't exist."""
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)
        print(f"Created dataset directory: {DATASET_DIR}")

    default_files = {
        "disease_information.json": DEFAULT_DISEASES,
        "food_recommendations.json": DEFAULT_FOOD_RECS,
        "exercise_recommendations.json": DEFAULT_EXERCISE_RECS,
        "recovery_tips.json": DEFAULT_RECOVERY_TIPS,
        "medicine_precautions.json": DEFAULT_MEDICINE_PRECAUTIONS,
        "emergency_symptoms.json": DEFAULT_EMERGENCY_SYMPTOMS,
        "nutrition_data.json": DEFAULT_NUTRITION_DATA,
        "symptom_mapping.json": DEFAULT_SYMPTOM_MAPPING,
        "lifestyle_recommendations.json": DEFAULT_LIFESTYLE_RECS,
        "user_history.json": DEFAULT_USER_HISTORY,
        "health_records.json": DEFAULT_HEALTH_RECORD,
    }

    for filename, default_data in default_files.items():
        filepath = os.path.join(DATASET_DIR, filename)
        if not os.path.exists(filepath):
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2, ensure_ascii=False)
            print(f"Initialized dataset file: {filename}")
        else:
            # Validate existing files
            try:
                load_and_validate(filename)
            except Exception as e:
                print(f"WARNING: File {filename} failed validation schema: {e}. Overwriting with default data.")
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(default_data, f, indent=2, ensure_ascii=False)


def load_and_validate(filename: str) -> Any:
    """Load a JSON file from dataset/ and validate it using the defined Pydantic schema."""
    filepath = os.path.join(DATASET_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File {filename} does not exist in dataset directory.")
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Validate against Pydantic schema
    schema_class = FILE_SCHEMAS.get(filename)
    if schema_class:
        # Pydantic v2 validation
        return schema_class.model_validate(data)
    return data


def save_dataset_file(filename: str, data: Any) -> None:
    """Save data to a dataset file after validation."""
    # Validate first
    schema_class = FILE_SCHEMAS.get(filename)
    if schema_class:
        if isinstance(data, dict):
            validated_obj = schema_class.model_validate(data)
            data_to_save = validated_obj.model_dump()
        elif hasattr(data, "model_validate"):
            validated_obj = data
            data_to_save = validated_obj.model_dump()
        else:
            validated_obj = schema_class.model_validate(data)
            data_to_save = validated_obj.model_dump()
    else:
        data_to_save = data

    filepath = os.path.join(DATASET_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data_to_save, f, indent=2, ensure_ascii=False)
    print(f"Successfully saved and validated {filename}")


# Automatically initialize upon import to ensure folder and files are present
initialize_all_datasets()
