import ollama

EMBEDDING_MODEL = "nomic-embed-text"

text = "AI & Data Science department"

response = ollama.embed(
    model=EMBEDDING_MODEL,
    input=text
)

embedding = response["embeddings"][0]

print("Embedding generated successfully!")
print("Vector dimension:", len(embedding))
print("First 5 values:", embedding[:5])