from datasets import load_dataset
import pandas as pd
import os

# Hugging Face dataset
DATASET_NAME = "tootooba/SMU_FAQDataset"

# Output directory
OUTPUT_DIR = "data/raw"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "faq_data_cleaned.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Downloading dataset...")

dataset = load_dataset(DATASET_NAME)

print("Dataset loaded successfully!")
print(dataset)

# Get the first split
split_name = list(dataset.keys())[0]

df = dataset[split_name].to_pandas()

print("\nColumns:")
print(df.columns.tolist())

print("\nNumber of rows:")
print(len(df))

# Keep only required columns
df = df[["question", "answer"]]

# Remove empty rows
df = df.dropna(subset=["question", "answer"])

# Convert to strings
df["question"] = df["question"].astype(str).str.strip()
df["answer"] = df["answer"].astype(str).str.strip()

# Remove duplicate questions
df = df.drop_duplicates(subset=["question"])

# Save
df.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8"
)

print("\nDataset prepared successfully!")
print(f"Rows: {len(df)}")
print(f"Saved to: {OUTPUT_FILE}")