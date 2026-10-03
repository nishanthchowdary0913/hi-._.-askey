import ollama

from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue


QDRANT_PATH = "data/processed/qdrant_db"

COLLECTION_NAME = "college_knowledge"

EMBEDDING_MODEL = "nomic-embed-text"

# Only show records whose semantic similarity is strong enough to support an answer.
MIN_RELEVANCE_SCORE = 0.55


# -----------------------------
# User question
# -----------------------------

query = input("Ask College Bot: ")
category = input("Category filter (press Enter for all categories): ").strip()


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
# Search
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

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    query_filter=query_filter,
    limit=3
).points


# -----------------------------
# Display results
# -----------------------------

relevant_results = [
    result for result in results if result.score >= MIN_RELEVANCE_SCORE
]

if not relevant_results:
    print(
        "\nI could not find sufficiently relevant information in the current "
        "college knowledge base."
    )
else:
    print("\nRelevant information:\n")

for i, result in enumerate(relevant_results, start=1):

    print(f"Result {i}")
    print(f"Score: {result.score}")
    print(f"Question: {result.payload['question']}")
    print(f"Answer: {result.payload['answer']}")
    print("-" * 60)


client.close()
