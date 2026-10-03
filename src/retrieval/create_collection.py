import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

load_dotenv()
COLLECTION_NAME = "college_knowledge"
EMBEDDING_DIMENSION = 768

client = QdrantClient(url=os.environ["QDRANT_URL"], api_key=os.environ["QDRANT_API_KEY"])
if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)
    print(f"Old cloud collection '{COLLECTION_NAME}' deleted.")
client.create_collection(collection_name=COLLECTION_NAME, vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE))
print(f"Cloud collection '{COLLECTION_NAME}' created.")
print(f"Embedding dimension: {EMBEDDING_DIMENSION}")
client.close()