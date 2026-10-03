"""JSON API adapter for the College Bot Qdrant/Ollama RAG pipeline."""

import json
import re
import sys
from pathlib import Path

import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue


ROOT = Path(__file__).resolve().parents[1]
QDRANT_PATH = str(ROOT / "data" / "processed" / "qdrant_db")
COLLECTION_NAME = "college_knowledge"
EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "llama3.2:3b"


def normalize_query(text: str) -> str:
    normalized = text.casefold()
    replacements = {
        "scholorship": "scholarship",
        "scholorships": "scholarships",
        "scholar ship": "scholarship",
        "timings": "hours",
        "working hours": "hours of operation",
        "college is start": "college opening hours",
        "college is ends": "college closing hours",
        "how do i get to college": "directions to Saint Mary's University campus public transit",
        "how can i get to campus": "directions to Saint Mary's University campus public transit",
        "how do i go to campus": "directions to Saint Mary's University campus public transit",
        "travel to campus": "directions to Saint Mary's University campus public transit",
    }
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)
    return normalized


def keywords(text: str) -> set[str]:
    stop_words = {
        "what", "is", "are", "the", "a", "an", "about", "for", "to", "of",
        "in", "on", "do", "i", "can", "where", "how", "does", "tell", "me",
        "please", "could", "would", "you", "give", "information", "available",
        "college",
    }
    return {
        word for word in re.findall(r"\b[a-zA-Z0-9]+\b", text.casefold())
        if word not in stop_words and len(word) > 1
    }


def keyword_score(query_words: set[str], document: str) -> float:
    if not query_words:
        return 0.0
    document_words = set(re.findall(r"\b[a-zA-Z0-9]+\b", document.casefold()))
    return sum(word in document_words for word in query_words) / len(query_words)


def answer_question(question: str, category: str = "") -> dict:
    normalized = normalize_query(question)
    expanded = f"{question}. Search meaning: {normalized}. Use equivalent natural-language terms."

    category_aliases = {
        "scholarship": "scholarships", "scholarships": "scholarships",
        "fee": "fees", "fees": "fees", "course": "courses", "courses": "courses",
        "exam": "examinations", "exams": "examinations",
        "admission": "admissions", "admissions": "admissions",
        "transportation": "transport", "transport": "transport",
    }
    category_value = category_aliases.get(category.casefold())
    query_filter = None
    if category_value:
        query_filter = Filter(must=[FieldCondition(key="category", match=MatchValue(value=category_value))])

    client = QdrantClient(path=QDRANT_PATH)
    try:
        vector = ollama.embeddings(model=EMBEDDING_MODEL, prompt=expanded)["embedding"]
        results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            query_filter=query_filter,
            limit=10,
        ).points

        # Never allow the placeholder Sree Venkateswara record or any other
        # non-SMU record to answer an SMU question.
        def is_smu_record(item):
            payload = item.payload
            source = str(payload.get("source", "")).casefold()
            source_url = str(payload.get("source_url", "")).casefold()
            return (
                source in {"smu_faqdataset", "smu_website"}
                or "smu.ca" in source_url
                or "courseleaf.com" in source_url
                or "smu.brightspace.com" in source_url
                or "ppm.smu.ca" in source_url
            )

        results = [item for item in results if is_smu_record(item)]
        query_words = keywords(normalized)
        ranked = []
        for item in results:
            question_text = item.payload.get("question", "")
            answer_text = item.payload.get("answer", "")
            score = item.score * 0.85 + keyword_score(query_words, f"{question_text} {answer_text}") * 0.15
            ranked.append((score, item))
        ranked.sort(key=lambda pair: pair[0], reverse=True)
        relevant = [item for score, item in ranked if item.score >= 0.55][:3]

        if not relevant:
            return {
                "response": "I couldn't find reliable information about that in the current knowledge base.",
                "confidence": 0.0,
                "sources": [],
                "grounded": True,
            }

        context = "\n\n".join(
            f"Source question: {item.payload.get('question', '')}\nSource answer: {item.payload.get('answer', '')}"
            for item in relevant
        )
        response = ollama.chat(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Hi Askey, a grounded university assistant. Answer only from the supplied sources. "
                        "If the sources do not answer the question, say that the information is unavailable. "
                        "Do not invent facts, dates, prices, hours, policies, or links. Keep the answer concise."
                    ),
                },
                {"role": "user", "content": f"Sources:\n{context}\n\nQuestion: {question}"},
            ],
        )
        sources = [
            {
                "title": item.payload.get("question", "Knowledge-base source"),
                "url": item.payload.get("source_url", "https://www.smu.ca/"),
                "type": item.payload.get("category", "University information"),
            }
            for item in relevant
        ]
        return {
            "response": response["message"]["content"],
            "confidence": 0.90,
            "sources": sources,
            "grounded": True,
        }
    finally:
        client.close()


def main() -> None:
    request = json.loads(sys.stdin.read())
    print(json.dumps(answer_question(request["message"], request.get("category", ""))))


if __name__ == "__main__":
    main()
