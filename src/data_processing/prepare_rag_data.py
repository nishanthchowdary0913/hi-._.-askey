import pandas as pd
import json
import os

INPUT_FILE = "data/raw/faq_data_cleaned.csv"
OUTPUT_FILE = "data/processed/college_faq.json"

os.makedirs("data/processed", exist_ok=True)

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

records = []

for index, row in df.iterrows():

    question = str(row["question"]).strip()
    answer = str(row["answer"]).strip()

    text = f"""Question: {question}

Answer: {answer}"""

    record = {
        "id": index + 1,
        "question": question,
        "answer": answer,
        "text": text,
        "category": "general",
        "department": "general",
        "source": "SMU_FAQDataset",
        "data_type": "demo"
    }

    records.append(record)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        records,
        file,
        indent=2,
        ensure_ascii=False
    )

print("\nRAG dataset prepared successfully!")

print(f"Records: {len(records)}")
print(f"Saved to: {OUTPUT_FILE}")