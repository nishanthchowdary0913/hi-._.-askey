import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

load_dotenv()
COLLECTION_NAME = "college_knowledge"
DATASET_FILE = "data/processed/college_faq_metadata.json"
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768
BATCH_SIZE = 25

with open(DATASET_FILE, "r", encoding="utf-8") as file:
    records = json.load(file)

ai = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
qdrant = QdrantClient(
    url=os.environ["QDRANT_URL"],
    api_key=os.environ["QDRANT_API_KEY"],
    timeout=120,
)

points = []
for index, record in enumerate(records, start=1):
    result = ai.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=record["text"],
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=EMBEDDING_DIMENSION,
        ),
    )
    vector = list(result.embeddings[0].values)
    payload = {
        "text": record["text"],
        "question": record["question"],
        "answer": record["answer"],
        "category": record["category"],
        "department": record["department"],
        "source": record["source"],
        "data_type": record["data_type"],
    }
    if "source_url" in record:
        payload["source_url"] = record["source_url"]
    points.append(PointStruct(id=record["id"], vector=vector, payload=payload))
    print(f"Embedded {index}/{len(records)}")

for start in range(0, len(points), BATCH_SIZE):
    batch = points[start:start + BATCH_SIZE]
    qdrant.upsert(collection_name=COLLECTION_NAME, points=batch, wait=True)
    print(f"Uploaded {min(start + BATCH_SIZE, len(points))}/{len(points)}")

print(f"Uploaded {len(points)} records to Qdrant Cloud.")
qdrant.close()