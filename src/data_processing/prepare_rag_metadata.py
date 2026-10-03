import csv
import json
import os


INPUT_FILE = "data/raw/faq_data_cleaned.csv"
OFFICIAL_INPUT_FILE = "data/raw/smu_official_faq.json"
COLLEGE_INFO_FILE = "data/raw/college_info.txt"
OUTPUT_FILE = "data/processed/college_faq_metadata.json"

os.makedirs("data/processed", exist_ok=True)


def classify_category(question, answer):
    # Classify from the question first: FAQ answers often mention several
    # unrelated topics (fees, courses, admissions), which caused false labels.
    text = str(question).casefold()

    if any(phrase in text for phrase in ("academic calendar", "academic year", "semester dates", "term dates")):
        return "academic_calendar"

    if any(phrase in text for phrase in ("admissions", "admission requirements", "admission to smu", "apply to smu", "apply for admission", "how do i apply to smu", "how can i apply to smu", "when can i apply at smu")):
        return "admissions"

    if any(phrase in text for phrase in ("scholarship", "financial aid", "bursary")):
        return "scholarships"

    if any(phrase in text for phrase in ("tuition", "student fee", "fees", "fee payment", "pay my fees", "cost of tuition")):
        return "fees"

    if any(phrase in text for phrase in ("exam", "examination", "test schedule", "grade", "finals")):
        return "examinations"

    if any(phrase in text for phrase in ("course", "class registration", "class schedule", "degree program", "degree programme", "program requirements", "programme requirements")):
        return "courses"

    if any(phrase in text for phrase in ("campus tour", "tour of the campus", "campus facilities", "library hours", "gym hours", "recreation facilities", "campus map", "building hours")):
        return "facilities"

    if any(phrase in text for phrase in ("campus event", "student club", "student organization", "student activity", "events calendar")):
        return "events"

    if any(phrase in text for phrase in ("metro transit", "transit schedule", "transit route", "bus pass", "bus schedule", "bus route", "transportation", "public transit", "upass", "u-pass")):
        return "transport"

    if any(phrase in text for phrase in ("contact information", "phone number", "email address", "contact the", "office hours")):
        return "contact_information"

    if any(phrase in text for phrase in ("university policy", "academic policy", "rules and regulations", "regulations", "code of conduct")):
        return "rules_regulations"

    if any(phrase in text for phrase in ("student services", "student support", "self-service banner", "self service banner")):
        return "student_services"

    return "general"


def classify_department(question, answer):
    # These records are general SMU demo FAQs, not department-specific data.
    return "general"


def build_search_text(question, answer, category):
    """Add natural-language cues to embeddings without changing the answer."""
    query = question.casefold()
    aliases = []
    if any(word in query for word in ("scholarship", "bursary", "financial aid")):
        aliases += ["scholarships", "student funding", "financial assistance", "awards"]
    if any(word in query for word in ("timing", "hours", "open", "close", "working hour")):
        aliases += ["opening hours", "closing hours", "hours of operation", "business hours"]
    if any(word in query for word in ("course", "class", "subject")):
        aliases += ["course registration", "class schedule", "subjects", "programs"]
    if any(word in query for word in ("fee", "tuition", "cost", "price")):
        aliases += ["fees", "tuition charges", "payment", "expenses"]
    cues = ", ".join(sorted(set(aliases)))
    return f"Question: {question}\n\nAnswer: {answer}\n\nCategory: {category}\nNatural language search terms: {cues}"


print("Loading cleaned dataset...")

with open(INPUT_FILE, "r", encoding="utf-8", newline="") as file:
    rows = list(csv.DictReader(file))

print(f"Records loaded: {len(rows)}")

records = []

for index, row in enumerate(rows):

    question = str(row["question"]).strip()
    answer = str(row["answer"]).strip()

    category = classify_category(question, answer)
    department = classify_department(question, answer)

    text = build_search_text(question, answer, category)

    record = {
        "id": index + 1,
        "question": question,
        "answer": answer,
        "text": text,
        "category": category,
        "department": department,
        "source": "SMU_FAQDataset",
        "data_type": "demo"
    }

    records.append(record)


if os.path.exists(COLLEGE_INFO_FILE):
    with open(COLLEGE_INFO_FILE, "r", encoding="utf-8") as file:
        college_info = file.read().strip()

    college_question = (
        "What information is available about the college? Tell me about the college "
        "name, location, courses, AI and Data Science, facilities, and contact information."
    )
    records.append({
        "id": len(records) + 1,
        "question": college_question,
        "answer": college_info,
        "text": build_search_text(college_question, college_info, "college_information"),
        "category": "college_information",
        "department": "general",
        "source": "college_info.txt",
        "data_type": "college_specific",
    })


if os.path.exists(OFFICIAL_INPUT_FILE):
    print("Loading official SMU records...")

    with open(OFFICIAL_INPUT_FILE, "r", encoding="utf-8") as file:
        official_records = json.load(file)

    for official_record in official_records:
        question = str(official_record["question"]).strip()
        answer = str(official_record["answer"]).strip()

        record = {
            "id": len(records) + 1,
            "question": question,
            "answer": answer,
            "text": build_search_text(question, answer, official_record["category"]),
            "category": official_record["category"],
            "department": official_record["department"],
            "source": "SMU_Website",
            "data_type": "official",
            "source_url": official_record["source_url"],
        }
        records.append(record)


with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(
        records,
        file,
        indent=2,
        ensure_ascii=False
    )


print("\n======================================")
print("METADATA PREPARATION COMPLETED")
print("======================================")

print(f"Records: {len(records)}")
print(f"Output: {OUTPUT_FILE}")

print("\nFirst 5 records:")

for record in records[:5]:
    print("--------------------------------------")
    print(f"ID: {record['id']}")
    print(f"Question: {record['question']}")
    print(f"Category: {record['category']}")
    print(f"Department: {record['department']}")
    print(f"Source: {record['source']}")
    print(f"Data Type: {record['data_type']}")
