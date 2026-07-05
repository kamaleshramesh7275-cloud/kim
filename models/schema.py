from pydantic import BaseModel, Field
from typing import List, Dict, Optional

# 1. Disease Information Schema
class DiseaseInfo(BaseModel):
    disease_name: str
    symptoms: List[str]
    description: str
    severity: str  # mild, moderate, severe

class DiseaseInformationList(BaseModel):
    diseases: List[DiseaseInfo]

# 2. Food Recommendations Schema
class FoodRec(BaseModel):
    recommended: List[str]
    avoid: List[str]

class FoodRecommendationsMap(BaseModel):
    recommendations: Dict[str, FoodRec]

# 3. Exercise Recommendations Schema
class ExerciseRec(BaseModel):
    recommended: List[str]
    avoid: List[str]
    notes: str

class ExerciseRecommendationsMap(BaseModel):
    recommendations: Dict[str, ExerciseRec]

# 4. Recovery Tips Schema
class RecoveryTips(BaseModel):
    tips: List[str]

class RecoveryTipsMap(BaseModel):
    recommendations: Dict[str, RecoveryTips]

# 5. Medicine Precautions Schema
class MedicinePrecautions(BaseModel):
    precautions: List[str]
    medications: List[str]

class MedicinePrecautionsMap(BaseModel):
    recommendations: Dict[str, MedicinePrecautions]

# 6. Emergency Symptoms Schema
class EmergencySymptoms(BaseModel):
    warning_signs: List[str]
    emergency_contact: Optional[str] = "911 or visit local emergency department immediately"

class EmergencySymptomsMap(BaseModel):
    recommendations: Dict[str, EmergencySymptoms]

# 7. Nutrition Data Schema
class NutritionData(BaseModel):
    hydration_advice: str
    caloric_recommendation: str
    electrolytes: str

class NutritionDataMap(BaseModel):
    recommendations: Dict[str, NutritionData]

# 8. Symptom Mapping Schema
class SymptomMapping(BaseModel):
    mapping: Dict[str, List[str]]  # symptom -> list of diseases

# 9. Lifestyle Recommendations Schema
class LifestyleRec(BaseModel):
    sleep_recommendation: str
    hygiene_recommendation: str
    stress_management: str

class LifestyleRecommendationsMap(BaseModel):
    recommendations: Dict[str, LifestyleRec]

# 10. User History Schema
class HistoryEntry(BaseModel):
    date: str
    symptoms: List[str]
    recommendations: Dict[str, List[str]]

class UserHistory(BaseModel):
    user_id: str = "default"
    history: List[HistoryEntry] = []

# 11. Health Records Schema
class HealthRecord(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    allergies: List[str] = []
    chronic_diseases: List[str] = []
    medications: List[str] = []
    previous_illnesses: List[str] = []
    food_preferences: List[str] = []  # e.g., vegetarian, vegan, gluten-free, none
    exercise_level: Optional[str] = "moderate"  # sedentary, light, moderate, active
    sleep_habits: Optional[str] = "7-8 hours"
