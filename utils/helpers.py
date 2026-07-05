import re
from typing import List, Dict, Set, Tuple, Any

STOP_WORDS = {
    "the", "and", "a", "an", "of", "to", "in", "is", "for", "with", "on", "at", "by", 
    "about", "as", "into", "like", "through", "after", "over", "between", "out", 
    "against", "during", "without", "before", "under", "around", "among", "what", 
    "how", "why", "who", "where", "when", "which", "should", "could", "would", 
    "i", "me", "my", "you", "your", "he", "she", "it", "they", "we", "us", "them", 
    "do", "does", "did", "to", "from", "up", "down", "have", "has", "had", "am", 
    "are", "was", "were", "be", "been", "being", "feel", "feeling", "got", "suffering"
}

def clean_text(text: str) -> str:
    """Lowercase text and strip punctuation."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', ' ', text)
    return " ".join(text.split())

def tokenize(text: str) -> List[str]:
    """Tokenize and filter stop words."""
    cleaned = clean_text(text)
    tokens = cleaned.split()
    return [t for t in tokens if t not in STOP_WORDS]

def match_symptoms_in_query(query: str, symptom_mapping: Dict[str, List[str]]) -> List[str]:
    """
    Detect symptoms mentioned in the query.
    Checks for exact phrase matches and token overlap.
    """
    query_clean = clean_text(query)
    query_tokens = set(tokenize(query))
    matched_symptoms = []

    for symptom in symptom_mapping.keys():
        symptom_clean = clean_text(symptom)
        
        # Scenario 1: Exact substring match (best for multi-word symptoms like "runny nose")
        if symptom_clean in query_clean:
            matched_symptoms.append(symptom)
            continue
            
        # Scenario 2: Token overlap (for rearranged/partial match)
        symptom_tokens = set(tokenize(symptom))
        if symptom_tokens and symptom_tokens.issubset(query_tokens):
            matched_symptoms.append(symptom)
            
    return list(set(matched_symptoms))

def calculate_disease_confidence(
    matched_symptoms: List[str],
    disease_info_list: List[Dict[str, Any]],
    symptom_mapping: Dict[str, List[str]]
) -> List[Tuple[str, float, List[str]]]:
    """
    For the matched symptoms, calculate matching diseases and confidence scores.
    Confidence score is calculated based on:
    - How many of the disease's symptoms are matched.
    - Weighing the specificity of symptoms (symptoms that occur in fewer diseases have higher weight).
    
    Returns:
        List of tuples: (disease_name, confidence_score, list_of_matched_symptoms_for_this_disease)
    """
    # 1. Identify which diseases match which symptoms
    disease_matches: Dict[str, List[str]] = {}
    
    # Pre-calculate symptom specificity weight: 1.0 / (number of diseases showing this symptom)
    symptom_weights: Dict[str, float] = {}
    for sym, diseases in symptom_mapping.items():
        if diseases:
            symptom_weights[sym] = 2.0 / (1.0 + len(diseases))  # highly specific = higher weight
        else:
            symptom_weights[sym] = 1.0

    for symptom in matched_symptoms:
        associated_diseases = symptom_mapping.get(symptom, [])
        for disease in associated_diseases:
            if disease not in disease_matches:
                disease_matches[disease] = []
            disease_matches[disease].append(symptom)

    # 2. Calculate confidence for each matching disease
    results = []
    # Create a lookup for total symptoms per disease
    disease_symptoms_lookup = {d["disease_name"]: d["symptoms"] for d in disease_info_list}

    for disease_name, matched in disease_matches.items():
        total_symptoms = disease_symptoms_lookup.get(disease_name, [])
        if not total_symptoms:
            continue
            
        # Calculate score
        # Sum of weights of matched symptoms divided by sum of weights of all symptoms of the disease
        # First, map disease symptoms to clean lowercased strings for matching
        clean_total_symptoms = [clean_text(s) for s in total_symptoms]
        
        matched_count = 0
        weight_sum_matched = 0.0
        weight_sum_total = 0.0
        
        # Calculate total weights
        for ds in total_symptoms:
            # find weight from symptom mapping
            # (lookup by matching text)
            matching_mapped_syms = [s for s in symptom_mapping.keys() if clean_text(s) == clean_text(ds)]
            weight = symptom_weights.get(matching_mapped_syms[0], 1.0) if matching_mapped_syms else 1.0
            weight_sum_total += weight

        # Calculate matched weights
        matched_resolved = []
        for m_sym in matched:
            # Check if this matched symptom maps to one of the disease's actual symptoms
            m_sym_clean = clean_text(m_sym)
            
            # Find if it is in the disease's symptoms
            for ds in total_symptoms:
                if clean_text(ds) == m_sym_clean or m_sym_clean in clean_text(ds) or clean_text(ds) in m_sym_clean:
                    if ds not in matched_resolved:
                        matched_resolved.append(ds)
                        weight = symptom_weights.get(m_sym, 1.0)
                        weight_sum_matched += weight
                        matched_count += 1
                        break
                        
        confidence = weight_sum_matched / weight_sum_total if weight_sum_total > 0 else 0.0
        # Cap confidence at 1.0
        confidence = min(confidence, 1.0)
        
        if confidence > 0.0:
            results.append((disease_name, confidence, matched_resolved))

    # Sort by confidence score descending
    results.sort(key=lambda x: x[1], reverse=True)
    return results
