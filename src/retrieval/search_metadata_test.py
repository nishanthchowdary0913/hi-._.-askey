"""Run a semantic query constrained to the transport metadata category."""
import ollama
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge_metadata_test"
EMBEDDING_MODEL = "nomic-embed-text"
QUERY = "What information is available about transportation?"

response = ollama.embed(model=EMBEDDING_MODEL, input=QUERY)
query_vector = response["embeddings"][0]

client = QdrantClient(path=QDRANT_PATH)
results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="transport"))]
    ),
    limit=5,
).points

for result in results:
    print(f"Score: {result.score:.4f} | {result.payload['question']}")
    print(result.payload["answer"])
    print("-" * 60)
client.close()
