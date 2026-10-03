import re
import ollama

from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge"

EMBEDDING_MODEL = "nomic-embed-text"

# Semantic similarity safety threshold.
MIN_RELEVANCE_SCORE = 0.55

# Hybrid score is only used as a ranking signal.
# We do NOT require a high keyword score.
MIN_HYBRID_SCORE = 0.50

SEMANTIC_LIMIT = 10
FINAL_LIMIT = 3


# -----------------------------
# User question
# -----------------------------

query = input("Ask College Bot: ").strip()

category = input(
    "Category filter (press Enter for all categories): "
).strip()


# -----------------------------
# Generate query embedding
# -----------------------------

response = ollama.embeddings(
    model=EMBEDDING_MODEL,
    prompt=query
)

query_vector = response["embedding"]


# -----------------------------
# Connect to Qdrant
# -----------------------------

client = QdrantClient(
    path=QDRANT_PATH
)


# -----------------------------
# Category filter
# -----------------------------

query_filter = None

if category:
    query_filter = Filter(
        must=[
            FieldCondition(
                key="category",
                match=MatchValue(value=category),
            )
        ]
    )


# -----------------------------
# Semantic search
# -----------------------------

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    query_filter=query_filter,
    limit=SEMANTIC_LIMIT,
).points


# -----------------------------
# Keyword extraction
# -----------------------------

def get_keywords(text):

    words = re.findall(
        r"\b[a-zA-Z0-9]+\b",
        text.lower()
    )

    stop_words = {
        "what",
        "is",
        "are",
        "the",
        "a",
        "an",
        "about",
        "for",
        "to",
        "of",
        "in",
        "on",
        "do",
        "i",
        "can",
        "where",
        "how",
        "does",
        "did",
        "tell",
        "me",
        "please",
        "could",
        "would",
        "you",
        "give",
        "information",
        "available",
        "college",
    }

    return {
        word
        for word in words
        if word not in stop_words
        and len(word) > 1
    }


query_keywords = get_keywords(query)


# -----------------------------
# Keyword score
# -----------------------------

def calculate_keyword_score(keywords, document_text):

    if not keywords:
        return 0.0

    document_words = set(
        re.findall(
            r"\b[a-zA-Z0-9]+\b",
            document_text.lower()
        )
    )

    matches = sum(
        1
        for keyword in keywords
        if keyword in document_words
    )

    return matches / len(keywords)


# -----------------------------
# Hybrid ranking
# -----------------------------

hybrid_results = []

for result in results:

    question = result.payload.get(
        "question",
        ""
    )

    answer = result.payload.get(
        "answer",
        ""
    )

    document_text = (
        f"{question} {answer}"
    )

    semantic_score = result.score

    keyword_score = calculate_keyword_score(
        query_keywords,
        document_text
    )

    # Semantic similarity is the main signal.
    # Keyword matching only provides additional ranking help.
    hybrid_score = (
        (semantic_score * 0.85)
        + (keyword_score * 0.15)
    )

    hybrid_results.append(
        {
            "result": result,
            "semantic_score": semantic_score,
            "keyword_score": keyword_score,
            "hybrid_score": hybrid_score,
        }
    )


# -----------------------------
# Sort by hybrid score
# -----------------------------

hybrid_results.sort(
    key=lambda item: item["hybrid_score"],
    reverse=True
)


# -----------------------------
# Relevance filtering
# -----------------------------

relevant_results = [
    item
    for item in hybrid_results
    if (
        item["semantic_score"] >= MIN_RELEVANCE_SCORE
        and item["hybrid_score"] >= MIN_HYBRID_SCORE
    )
][:FINAL_LIMIT]


# -----------------------------
# Display results
# -----------------------------

if not relevant_results:

    print(
        "\nI could not find sufficiently relevant information "
        "in the current college knowledge base."
    )

else:

    print("\nHybrid Retrieval Results:\n")

    for i, item in enumerate(
        relevant_results,
        start=1
    ):

        result = item["result"]

        print(f"Result {i}")

        print(
            f"Semantic Score: "
            f"{item['semantic_score']:.4f}"
        )

        print(
            f"Keyword Score:  "
            f"{item['keyword_score']:.4f}"
        )

        print(
            f"Hybrid Score:   "
            f"{item['hybrid_score']:.4f}"
        )

        print(
            f"Question: "
            f"{result.payload['question']}"
        )

        print(
            f"Answer: "
            f"{result.payload['answer']}"
        )

        if "source_url" in result.payload:

            print(
                f"Source: "
                f"{result.payload['source_url']}"
            )

        print("-" * 60)


client.close()