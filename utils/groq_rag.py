import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

import faiss
import numpy as np
from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "public" / "data"
CACHE_DIR = BASE_DIR / ".cache" / "rag"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def load_environment() -> Dict[str, str]:
    load_dotenv(BASE_DIR / ".env.local")
    load_dotenv(BASE_DIR / ".env")
    return {
        "groq_api_key": os.getenv("GROQ_API_KEY", ""),
        "groq_model": os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL),
    }


def parse_csv_documents() -> List[Dict[str, Any]]:
    documents: List[Dict[str, Any]] = []
    for file_name in [
        "Athlete_recovery_dataset.csv",
        "Athlete_Training_Recovery_Tracker_Dataset.csv",
        "multimodal_sports_injury_dataset.csv",
    ]:
        file_path = DATA_DIR / file_name
        if not file_path.exists():
            continue

        with file_path.open("r", encoding="utf-8") as handle:
            import csv

            reader = csv.DictReader(handle)
            for row in reader:
                text_parts = []
                for key, value in row.items():
                    if value and str(value).strip():
                        text_parts.append(f"{key}: {value}")
                if text_parts:
                    documents.append(
                        {
                            "id": f"{file_name}:{len(documents) + 1}",
                            "source": file_name,
                            "text": " | ".join(text_parts),
                        }
                    )
    return documents


def parse_markdown_documents() -> List[Dict[str, Any]]:
    documents: List[Dict[str, Any]] = []
    knowledge_path = DATA_DIR / "recovery-rag-documents.md"
    if not knowledge_path.exists():
        return documents

    content = knowledge_path.read_text(encoding="utf-8")
    sections = [section.strip() for section in content.split("\n## ") if section.strip()]
    for index, section in enumerate(sections, start=1):
        section_text = re.sub(r"^#.*$", "", section, flags=re.MULTILINE).strip()
        if section_text:
            documents.append(
                {
                    "id": f"knowledge-{index}",
                    "source": "recovery-rag-documents.md",
                    "text": section_text,
                }
            )
    return documents


def load_documents() -> List[Dict[str, Any]]:
    documents = parse_csv_documents() + parse_markdown_documents()
    return documents


def build_or_load_index(documents: List[Dict[str, Any]]):
    index_path = CACHE_DIR / "faiss.index"
    metadata_path = CACHE_DIR / "documents.json"

    if index_path.exists() and metadata_path.exists() and len(documents) > 0:
        try:
            index = faiss.read_index(str(index_path))
            saved_documents = json.loads(metadata_path.read_text(encoding="utf-8"))
            if len(saved_documents) == len(documents):
                return index, saved_documents
        except Exception:
            pass

    if not documents:
        index = faiss.IndexFlatIP(1)
        return index, []

    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    embeddings = model.encode([doc["text"] for doc in documents], normalize_embeddings=True, convert_to_numpy=True)
    embeddings = np.asarray(embeddings, dtype=np.float32)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    faiss.write_index(index, str(index_path))
    metadata_path.write_text(json.dumps(documents, ensure_ascii=False), encoding="utf-8")
    return index, documents


def retrieve_context(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    documents = load_documents()
    if not documents:
        return []

    index, stored_documents = build_or_load_index(documents)
    if not stored_documents:
        return []

    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    query_embedding = model.encode([query], normalize_embeddings=True, convert_to_numpy=True).astype(np.float32)
    distances, indices = index.search(query_embedding, min(top_k, len(stored_documents)))

    results: List[Dict[str, Any]] = []
    for rank, doc_index in enumerate(indices[0], start=1):
        if doc_index < 0 or doc_index >= len(stored_documents):
            continue
        doc = stored_documents[int(doc_index)]
        results.append(
            {
                "id": doc.get("id", f"doc-{rank}"),
                "source": doc.get("source", "unknown"),
                "text": doc.get("text", ""),
                "score": float(distances[0][rank - 1]),
            }
        )

    return results


def build_prompt(query: str, context_docs: List[Dict[str, Any]]) -> str:
    context_text = "\n\n".join(
        [f"[Source: {doc['source']}]\n{doc['text']}" for doc in context_docs]
        if context_docs
        else ["No direct matching recovery knowledge documents were found."]
    )

    return f"""You are Smart Recovery AI, a supportive athletic recovery coach and injury-awareness assistant.
Use the retrieved recovery knowledge to answer the user's request clearly and safely.
If the context is useful, ground your advice in it and paraphrase it naturally.
If the context is limited, give a cautious general recovery plan.

Retrieved knowledge:
---
{context_text}
---

User question: {query}

Write a concise answer with:
- a short overview
- three clear sections: WHAT TO DO, HOW TO CONTINUE PROGRESS, and WHAT TO EAT
- practical coaching language
- a clear note that this is educational guidance and not a substitute for professional medical advice
"""


def generate_reply(query: str, context_docs: List[Dict[str, Any]], groq_api_key: str, groq_model: str) -> str:
    if not groq_api_key:
        return (
            "I found a few relevant recovery signals and here is a safe coaching-style response:\n\n"
            "- Rest and monitor fatigue, soreness, and sleep quality closely.\n"
            "- Keep hydration steady and avoid pushing through heavy training if your body is warning you.\n"
            "- Prioritize balanced meals with protein and carbohydrates while you recover."
        )

    try:
        client = Groq(api_key=groq_api_key)
        response = client.chat.completions.create(
            model=groq_model,
            messages=[
                {"role": "system", "content": "You are a supportive athletic recovery coach."},
                {"role": "user", "content": build_prompt(query, context_docs)},
            ],
            temperature=0.6,
            max_tokens=240,
        )
        return response.choices[0].message.content or "No response generated." 
    except Exception as exc:
        return f"I could not reach the Groq model right now. Please try again shortly. Error: {exc}"


def main() -> None:
    env_config = load_environment()
    api_key = env_config["groq_api_key"]
    model_name = env_config["groq_model"]

    if len(sys.argv) > 1:
        payload = {"message": sys.argv[1]}
    else:
        raw_input = sys.stdin.read().strip()
        payload = json.loads(raw_input) if raw_input else {}

    query = payload.get("message", "")
    if not query:
        print(json.dumps({"reply": "Please provide a question to continue.", "matchedSources": []}))
        return

    context_docs = retrieve_context(query, top_k=4)
    reply = generate_reply(query, context_docs, api_key, model_name)
    print(
        json.dumps(
            {
                "reply": reply,
                "matchedSources": [
                    {"source": doc.get("source", "unknown"), "text": doc.get("text", ""), "score": doc.get("score", 0.0)}
                    for doc in context_docs
                ],
            }
        )
    )


if __name__ == "__main__":
    main()
