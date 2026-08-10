"""
seed_db.py
==========
Creates the SQLite tables (if not already created) and inserts:
  - one demo doctor login account
  - a handful of sample patients with real predictions run through the
    actual trained models (not hardcoded numbers)

Run this AFTER training the models:
    python ml_training/train_all.py
    python seed_db.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import hash_password
from app.ml import predictor

DEMO_EMAIL = "doctor@vitalsignai.com"
DEMO_PASSWORD = "Demo@123"

SAMPLE_PATIENTS = [
    {"name": "Robert Chen", "age": 64, "gender": "Male", "history": "Type 2 Diabetes"},
    {"name": "Sarah Jenkins", "age": 58, "gender": "Female", "history": "Hypertension"},
    {"name": "Elena Jordan", "age": 47, "gender": "Female", "history": "Family history of heart disease"},
    {"name": "Marcus Miller", "age": 55, "gender": "Male", "history": "Chronic kidney concerns"},
]

SAMPLE_INPUTS = {
    "diabetes": {
        "Pregnancies": 4, "Glucose": 168, "BloodPressure": 82, "SkinThickness": 30,
        "Insulin": 140, "BMI": 36.5, "DiabetesPedigreeFunction": 0.9, "Age": 64,
    },
    "heart": {
        "age": 58, "sex": 1, "cp": 2, "trestbps": 152, "chol": 289, "fbs": 1,
        "restecg": 1, "thalach": 128, "exang": 1, "oldpeak": 2.4, "slope": 1, "ca": 2, "thal": 2,
    },
    "kidney": {
        "age": 55, "bp": 92, "sg": 1.010, "al": 3, "su": 1, "bgr": 210, "bu": 78,
        "sc": 3.4, "sod": 133, "pot": 5.1, "hemo": 10.2, "wbcc": 9800, "rbcc": 3.9,
        "htn": "yes", "dm": "yes", "cad": "no", "appet": "poor", "pe": "yes", "ane": "yes",
    },
    "liver": {
        "Age": 47, "Gender": "Female", "Total_Bilirubin": 3.2, "Direct_Bilirubin": 1.4,
        "Alkaline_Phosphotase": 410, "Alamine_Aminotransferase": 95, "Aspartate_Aminotransferase": 110,
        "Total_Protiens": 6.0, "Albumin": 2.6, "Albumin_and_Globulin_Ratio": 0.7,
    },
}


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.email == DEMO_EMAIL).first():
            demo_user = models.User(
                name="Dr. Alex Rivera",
                email=DEMO_EMAIL,
                password_hash=hash_password(DEMO_PASSWORD),
                role="Doctor",
                specialty="Chief of Cardiology",
            )
            db.add(demo_user)
            db.commit()
            print(f"Created demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            print("Demo user already exists, skipping.")

        if db.query(models.Patient).count() == 0:
            diseases_cycle = ["diabetes", "heart", "kidney", "liver"]
            for i, p in enumerate(SAMPLE_PATIENTS):
                import random
                patient = models.Patient(
                    mrn=f"MRN-{random.randint(10000, 99999)}",
                    name=p["name"], age=p["age"], gender=p["gender"],
                    medical_history=p["history"],
                )
                db.add(patient)
                db.commit()
                db.refresh(patient)

                disease = diseases_cycle[i % len(diseases_cycle)]
                try:
                    result = predictor.predict(disease, SAMPLE_INPUTS[disease])
                    import json
                    pred = models.Prediction(
                        patient_id=patient.id,
                        disease=disease,
                        input_values=json.dumps(SAMPLE_INPUTS[disease]),
                        prediction=result["prediction"],
                        confidence=result["confidence"],
                        risk_level=result["risk_level"],
                        model_used=result["model_used"],
                    )
                    db.add(pred)
                    db.commit()
                    print(f"Seeded prediction for {p['name']}: {disease} -> {result['risk_level']} risk ({result['confidence']}%)")
                except predictor.ModelNotFoundError:
                    print(f"WARNING: no trained model for '{disease}' yet -- skipping sample prediction. "
                          f"Run ml_training/train_all.py first.")
        else:
            print("Patients already exist, skipping sample data.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
