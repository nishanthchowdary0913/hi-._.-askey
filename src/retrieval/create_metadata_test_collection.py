"""Create the isolated collection for metadata filtering experiments."""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge_metadata_test"
VECTOR_SIZE = 768  # nomic-embed-text embedding size

client = QdrantClient(path=QDRANT_PATH)
if client.collection_exists(COLLECTION_NAME):
    print(f"Collection {COLLECTION_NAME!r} already exists; leaving it intact.")
else:
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    print(f"Created {COLLECTION_NAME} with {VECTOR_SIZE}-dimensional cosine vectors.")
client.close()
