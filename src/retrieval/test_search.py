import ollama
from qdrant_client import QdrantClient

QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge_test"
EMBEDDING_MODEL = "nomic-embed-text"

query = input("Ask test College Bot: ")

# Create embedding for the user's question
response = ollama.embeddings(
    model=EMBEDDING_MODEL,
    prompt=query
)

query_vector = response["embedding"]

# Connect to test collection
client = QdrantClient(path=QDRANT_PATH)

# Search
results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    limit=5
).points

print("\n========== RETRIEVED RESULTS ==========\n")

for i, result in enumerate(results, start=1):

    payload = result.payload

    print(f"Result {i}")
    print(f"Score: {result.score}")
    print(f"Question: {payload.get('question', 'N/A')}")
    print(f"Answer: {payload.get('answer', 'N/A')}")
    print("-" * 70)

client.close()