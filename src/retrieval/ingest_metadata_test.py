"""Embed the classified FAQ records into an isolated Qdrant test collection."""
import json

import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge_metadata_test"
DATASET_FILE = "data/processed/college_faq_metadata.json"
EMBEDDING_MODEL = "nomic-embed-text"


with open(DATASET_FILE, "r", encoding="utf-8") as file:
    records = json.load(file)

client = QdrantClient(path=QDRANT_PATH)
if not client.collection_exists(COLLECTION_NAME):
    raise RuntimeError(
        f"Collection {COLLECTION_NAME!r} does not exist. "
        "Run create_metadata_test_collection.py first."
    )

points = []
for record in records:
    response = ollama.embed(model=EMBEDDING_MODEL, input=record["text"])
    vector = response["embeddings"][0]
    points.append(
        PointStruct(
            id=record["id"],
            vector=vector,
            payload={key: record[key] for key in (
                "text", "question", "answer", "category", "department", "source", "data_type"
            )},
        )
    )

client.upsert(collection_name=COLLECTION_NAME, points=points)
print(f"Stored {len(points)} metadata records in {COLLECTION_NAME}.")
client.close()
