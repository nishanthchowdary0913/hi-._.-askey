"""JSON API adapter for Hi Askey using Gemini and Qdrant Cloud."""

import json
import os
import re
import sys

from dotenv import load_dotenv
from google import genai
from google.genai import types
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue

load_dotenv()

COLLECTION_NAME = "college_knowledge"
EMBEDDING_MODEL = "gemini-embedding-001"
ANSWER_MODEL = "gemini-2.5-flash"
MIN_RELEVANCE_SCORE = 0.55


def normalize_query(text: str) -> str:
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
    normalized = text.casefold()
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


def is_smu_record(item) -> bool:
    payload = item.payload or {}
    source = str(payload.get("source", "")).casefold()
    source_url = str(payload.get("source_url", "")).casefold()
    return (
        source in {"smu_faqdataset", "smu_website"}
        or "smu.ca" in source_url
        or "courseleaf.com" in source_url
        or "smu.brightspace.com" in source_url
        or "ppm.smu.ca" in source_url
    )


def answer_question(question: str, category: str = "") -> dict:
    normalized = normalize_query(question)
    expanded = (
        f"{question}. Search meaning: {normalized}. "
        "Interpret natural language, spelling mistakes, and equivalent words."
    )

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
        query_filter = Filter(
            must=[FieldCondition(key="category", match=MatchValue(value=category_value))]
        )

    gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    qdrant = QdrantClient(
        url=os.environ["QDRANT_URL"],
        api_key=os.environ["QDRANT_API_KEY"],
        timeout=120,
    )
    try:
        embedding = gemini.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=expanded,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=768,
            ),
        )
        vector = embedding.embeddings[0].values
        results = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            query_filter=query_filter,
            limit=10,
        ).points
        results = [item for item in results if is_smu_record(item)]

        query_words = keywords(normalized)
        ranked = []
        for item in results:
            payload = item.payload or {}
            document = f"{payload.get('question', '')} {payload.get('answer', '')}"
            score = item.score * 0.85 + keyword_score(query_words, document) * 0.15
            ranked.append((score, item))
        ranked.sort(key=lambda pair: pair[0], reverse=True)
        relevant = [item for _, item in ranked if item.score >= MIN_RELEVANCE_SCORE][:3]

        if not relevant:
            return {
                "response": "I don't have that information in the current knowledge base.",
                "confidence": 0.0,
                "sources": [],
                "grounded": True,
            }

        context = "\n\n".join(
            f"[Source {index}]\n"
            f"Question: {(item.payload or {}).get('question', '')}\n"
            f"Answer: {(item.payload or {}).get('answer', '')}"
            for index, item in enumerate(relevant, start=1)
        )
        prompt = f"""You are Hi Askey, the Saint Mary's University information assistant.
Answer only from the supplied sources. Do not invent facts, dates, prices, policies,
hours, transportation details, course information, or links. If the sources do not
answer the question, say exactly: I don't have that information in the current
knowledge base. Give a concise, helpful answer in natural English.

Sources:
{context}

User question: {question}
"""
        generated = gemini.models.generate_content(model=ANSWER_MODEL, contents=prompt)
        response_text = generated.text or "I don't have that information in the current knowledge base."
        sources = []
        for item in relevant:
            payload = item.payload or {}
            sources.append({
                "title": payload.get("question", "Knowledge-base source"),
                "url": payload.get("source_url", "https://www.smu.ca/"),
                "type": payload.get("category", "University information"),
            })
        return {
            "response": response_text,
            "confidence": 0.90,
            "sources": sources,
            "grounded": True,
        }
    finally:
        qdrant.close()


def main() -> None:
    request = json.loads(sys.stdin.read())
    print(json.dumps(answer_question(request["message"], request.get("category", ""))))


if __name__ == "__main__":
    main()
