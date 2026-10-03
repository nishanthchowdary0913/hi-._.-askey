import ollama
from qdrant_client import QdrantClient


QDRANT_PATH = "data/processed/qdrant_db"
COLLECTION_NAME = "college_knowledge_test"

EMBEDDING_MODEL = "nomic-embed-text"
LLM_MODEL = "llama3.2:3b"


# -----------------------------
# Ask question
# -----------------------------

query = input("Ask test College Bot: ")


# -----------------------------
# Create query embedding
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
# Retrieve relevant documents
# -----------------------------

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    limit=3
).points


# -----------------------------
# Build context
# -----------------------------

context = ""

for result in results:

    context += result.payload["text"]
    context += "\n\n"


# -----------------------------
# Create RAG prompt
# -----------------------------

prompt = f"""
You are a college information assistant.

Answer the user's question using ONLY the information
provided in the context below.

Do not use outside knowledge.

Do not invent information.

If the answer is not available in the context, say:

"I don't have that information in the current knowledge base."

Context:
{context}

User Question:
{query}

Answer:
"""


# -----------------------------
# Send context to Llama
# -----------------------------

response = ollama.chat(
    model=LLM_MODEL,
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ]
)


# -----------------------------
# Display answer
# -----------------------------

print("\n========== COLLEGE BOT ==========\n")

print(response["message"]["content"])


client.close()