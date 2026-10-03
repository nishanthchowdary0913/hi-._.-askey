from qdrant_client import QdrantClient

QDRANT_PATH = "data/processed/qdrant_db"

client = QdrantClient(path=QDRANT_PATH)

print("Qdrant connection successful!")
print("Qdrant is running in local mode.")

client.close()
print("Qdrant connection closed.")