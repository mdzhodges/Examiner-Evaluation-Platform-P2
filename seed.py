import pandas as pd
from pymongo import MongoClient
from datetime import datetime
import os

# --- CONFIGURATION ---
# Replace with your actual DB name
MONGO_URI = "mongodb+srv://matthodgess384_db_user:5v7PDqQE7qTAf35i@main.w9nqekt.mongodb.net/?appName=Main"
CSV_PATH = "/home/matt/Desktop/Git/Examiner-Evaluation-Platform/Answers.csv"
RUN_COUNT_CONSTANT = 1000

# Official Questions Mapping
QUESTIONS_MAP = {
    1: "Which CAD/CAM technology can be recommended for the production of an interim implant-supported fixed dental prosthesis?",
    2: "Which CAD/CAM technology can be recommended for the production of a definitive implant-supported fixed dental prosthesis?",
    3: "When should the implant abutment be selected?",
    4: "Which titanium base abutment shoulder height should be selected for bone-level conical-connection implants?",
    5: "Which factors contribute to retention of suprastructures to the titanium base abutments?",
    6: "Can titanium base abutments be used for all single implant crowns?",
    7: "What prosthetic design is recommended to treat multiple missing teeth in posterior edentulous sites with a fixed implant restoration?",
    8: "How many implants are needed to support a fixed restoration to replace at least three missing teeth in the posterior area?",
    9: "What is the restorative material of choice for posterior multi-unit fixed implant-supported restorations?",
    10: "In fully edentulous patients, can a CIFDP or an IOD be recommended to provide optimal stability and comfort?",
    11: "What is the ideal attachment for a mandibular IOD?",
    12: "With respect to oral function, should implant-retained/supported prostheses be considered the best treatment option in completely edentulous patients?",
    13: "In edentulous patients, does implant treatment reduce alveolar bone resorption compared to complete denture treatment?",
    14: "When tooth replacement is indicated in partially edentulous patients, can iFDPs be recommended over RDPs?",
    15: "What must be considered when using zirconia for implant-supported multi-unit fixed dental prostheses?"
}

# Model Registry for runtime mapping
MODEL_REGISTRY = {
    "gpt": "GPT-4.1",
    "claude": "Claude Opus 4.1",
    "llama3": "Llama-3-70B",
    "mistral": "Mistral-Large-2"
}


def seed_database():
    # 1. Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client.get_database("examiner_db")

    # Drop the database before seeding
    print("🗑️  Dropping existing database...")
    client.drop_database("examiner_db")
    print("✅ Database dropped successfully")

    # Reconnect to the (now empty) database
    db = client.get_database("examiner_db")
    # Ensure this matches your Mongoose collection name
    collection = db["representative_answers"]

    # 2. Load Local Data
    if not os.path.exists(CSV_PATH):
        print(f"❌ Error: File not found at {CSV_PATH}")
        return

    # Use sep=None to let pandas auto-detect if you have weird spacing in the CSV
    df = pd.read_csv(CSV_PATH)

    # 3. Clean and Transform
    print("🧹 Cleaning data and applying runtime logic...")
    records = []

    for _, row in df.iterrows():
        try:
            # Handle potential float versions of IDs (e.g., 1.0 -> 1)
            q_id = int(float(row['Question ID']))
            c_id = int(float(row['Cluster ID']))

            # Runtime Model Logic
            # If "Model Name" contains "All", we count it as 4. Otherwise 1.
            model_raw = str(row['Model Name']).strip().lower()
            m_count = "4" if "all" in model_raw else "1"

            doc = {
                "question_id": q_id,
                "question_text": QUESTIONS_MAP.get(q_id, "Unknown Question"),
                "cluster_id": f"q{q_id}_cluster_{str(c_id).zfill(2)}",
                "representative_answer_text": str(row['Answer Text']).strip().replace('\n', ' '),
                "cluster_frequency": int(row['Cluster Frequency']),
                "model_contributions": {
                    "model_count": MODEL_REGISTRY[model_raw],
                    "run_count": RUN_COUNT_CONSTANT
                },
                "created_at": datetime.utcnow(),
                "__v": 0
            }
            records.append(doc)
        except Exception as e:
            print(f"⚠️ Skipping row due to error: {e}")

    # 4. Insert into DB
    if records:
        # SWE Best Practice: Clear collection before seeding to prevent duplicates
        collection.delete_many({})

        result = collection.insert_many(records)
        print(
            f"✅ Successfully inserted {len(result.inserted_ids)} medical audit records.")
    else:
        print("⚠️ No valid records found to insert.")


if __name__ == "__main__":
    seed_database()
