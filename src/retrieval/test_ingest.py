import json
import ollama

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


# --------------------------------
# Configuration
# --------------------------------

QDRANT_PATH = "data/processed/qdrant_db"

COLLECTION_NAME = "college_knowledge_test"

DATASET_FILE = "data/processed/college_faq.json"

EMBEDDING_MODEL = "nomic-embed-text"


# --------------------------------
# Load prepared dataset
# --------------------------------

print("Loading prepared dataset...")

with open(DATASET_FILE, "r", encoding="utf-8") as file:
    records = json.load(file)

print(f"Records loaded: {len(records)}")


# --------------------------------
# Connect to Qdrant
# --------------------------------

client = QdrantClient(path=QDRANT_PATH)

print("Connected to Qdrant!")


# --------------------------------
# Create test collection
# --------------------------------

if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)
    print("Old test collection deleted.")


client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(
        size=768,
        distance=Distance.COSINE
    )
)

print("Test collection created!")


# --------------------------------
# Generate embeddings
# --------------------------------

points = []

for record in records:

    text = record["text"]

    response = ollama.embeddings(
        model=EMBEDDING_MODEL,
        prompt=text
    )

    vector = response["embedding"]

    point = PointStruct(
        id=record["id"],
        vector=vector,
        payload={
            "text": record["text"],
            "question": record["question"],
            "answer": record["answer"],
            "category": record["category"],
            "department": record["department"],
            "source": record["source"],
            "data_type": record["data_type"]
        }
    )

    points.append(point)

    print(f"Embedded {record['id']}/{len(records)}")


# --------------------------------
# Store in test Qdrant collection
# --------------------------------

client.upsert(
    collection_name=COLLECTION_NAME,
    points=points
)

print()
print("=" * 50)
print("SAFE TEST INGESTION COMPLETED")
print("=" * 50)
print(f"Collection: {COLLECTION_NAME}")
print(f"Records stored: {len(points)}")


client.close()