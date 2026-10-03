"""Ask grounded questions using Gemini and Qdrant Cloud."""

import os
import re

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
SEMANTIC_LIMIT = 10
FINAL_LIMIT = 3

query = input("Ask College Bot: ").strip()
category = input("Category filter (press Enter for all categories): ").strip()


def normalize_query(text):
    replacements = {
        "scholorship": "scholarship",
        "scholorships": "scholarships",
        "scholar ship": "scholarship",
        "timings": "hours",
        "college starts": "college opening hours",
        "college ends": "college closing hours",
        "working hours": "hours of operation",
        "open time": "opening hours",
        "close time": "closing hours",
    }
    normalized = text.casefold()
    for old, new in replacements.items():
        normalized = normalized.replace(old, new)
    return normalized


def keywords(text):
    stop_words = {
        "what", "is", "are", "the", "a", "an", "about", "for", "to",
        "of", "in", "on", "do", "i", "can", "where", "how", "does",
        "did", "tell", "me", "please", "could", "would", "you", "give",
        "information", "available", "college",
    }
    return {
        word for word in re.findall(r"\b[a-zA-Z0-9]+\b", text.casefold())
        if word not in stop_words and len(word) > 1
    }


def keyword_score(words, document):
    if not words:
        return 0.0
    document_words = set(re.findall(r"\b[a-zA-Z0-9]+\b", document.casefold()))
    return sum(word in document_words for word in words) / len(words)


if not query:
    raise SystemExit("Please enter a question.")

normalized = normalize_query(query)
expanded = (
    f"{query}. Search meaning: {normalized}. "
    "Interpret natural language, spelling mistakes, and equivalent words."
)

gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
qdrant = QdrantClient(
    url=os.environ["QDRANT_URL"],
    api_key=os.environ["QDRANT_API_KEY"],
    timeout=120,
)

embedding = gemini.models.embed_content(
    model=EMBEDDING_MODEL,
    contents=expanded,
    config=types.EmbedContentConfig(
        task_type="RETRIEVAL_QUERY",
        output_dimensionality=768,
    ),
)
query_vector = embedding.embeddings[0].values

category_aliases = {
    "scholarship": "scholarships",
    "fee": "fees",
    "course": "courses",
    "exam": "examinations",
    "exams": "examinations",
    "admission": "admissions",
}
category_value = category_aliases.get(category.casefold())
query_filter = None
if category_value:
    query_filter = Filter(
        must=[FieldCondition(key="category", match=MatchValue(value=category_value))]
    )

results = qdrant.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    query_filter=query_filter,
    limit=SEMANTIC_LIMIT,
).points

ranked = []
query_words = keywords(normalized)
for result in results:
    payload = result.payload or {}
    document = f"{payload.get('question', '')} {payload.get('answer', '')}"
    score = (result.score * 0.85) + (keyword_score(query_words, document) * 0.15)
    ranked.append((score, result))

ranked.sort(key=lambda item: item[0], reverse=True)
relevant = [item for item in ranked if item[1].score >= MIN_RELEVANCE_SCORE][:FINAL_LIMIT]

if not relevant:
    print("\nCollege Bot: I don't have sufficiently relevant information in the current knowledge base to answer that question.")
    raise SystemExit(0)

source_blocks = []
for index, (_, result) in enumerate(relevant, start=1):
    payload = result.payload or {}
    source_blocks.append(
        f"[Source {index}]\n"
        f"Question: {payload.get('question', '')}\n"
        f"Answer: {payload.get('answer', '')}"
    )

context = "\n\n".join(source_blocks)
prompt = f"""You are Hi Askey, the Saint Mary's University information assistant.
Answer only from the supplied sources. Do not invent facts, dates, prices, policies,
links, transportation details, or course information. If the sources do not answer
the question, say exactly: I don't have that information in the current knowledge base.
Give a concise, helpful answer in natural English.

Sources:
{context}

User question: {query}
"""

answer = gemini.models.generate_content(model=ANSWER_MODEL, contents=prompt)
print("\nCollege Bot:\n")
print(answer.text or "I don't have that information in the current knowledge base.")

print("\nSources used:")
for index, (_, result) in enumerate(relevant, start=1):
    payload = result.payload or {}
    print(f"{index}. {payload.get('question', '')}")
    if payload.get("source_url"):
        print(f"   {payload['source_url']}")

qdrant.close()
