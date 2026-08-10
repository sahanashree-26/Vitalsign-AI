# VitalSignAI

**Early Disease Prediction Using Machine Learning on Health Data**

A full-stack clinical decision-support demo that predicts risk for **Diabetes, Heart Disease, Kidney Disease, and Liver Disease** from patient health data, using real, independently-trained ML models per disease.

---

## ⚠️ Important note on the datasets (read this first)

This project was built in a sandbox with **no internet access**, so the real public
datasets (Pima Indians Diabetes, Cleveland Heart Disease, UCI Chronic Kidney
Disease, UCI Indian Liver Patient Dataset) could not be downloaded.

Instead, `backend/ml_training/generate_datasets.py` **generates synthetic data
that uses the exact same column names/schema** as those real datasets, with
realistic clinical relationships baked in (e.g. higher glucose + BMI + age →
higher diabetes risk, plus random noise). All model training, evaluation, and
the accuracy/precision/recall/F1 numbers shown in the app are computed for
real from this data — nothing is hardcoded or faked.

**For your actual submission, swap in the real datasets:**
1. Download `diabetes.csv`, `heart.csv`, `kidney.csv`, `liver.csv` from Kaggle/UCI
   (search "Pima Indians Diabetes", "Cleveland Heart Disease UCI", "Chronic
   Kidney Disease UCI", "Indian Liver Patient Dataset").
2. Make sure the column names match what's listed in each `train_<disease>.py`
   file (rename columns if needed).
3. Drop the CSVs into `backend/ml_training/datasets/`, overwriting the
   synthetic ones.
4. Re-run `python train_all.py`. Everything downstream (API, dashboard,
   analytics) automatically picks up the new metrics — no other code changes.

---

## Project Structure

```
vitalsignai/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint
│   │   ├── database.py            # SQLite + SQLAlchemy setup
│   │   ├── models.py              # ORM models (Users, Patients, Predictions, Reports)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── auth.py                # JWT auth + password hashing
│   │   ├── ml/predictor.py        # Loads trained models, runs predictions
│   │   └── routers/               # auth, patients, predictions, dashboard,
│   │                               # risk_alerts, analytics, reports, settings
│   ├── ml_training/
│   │   ├── generate_datasets.py   # Synthetic dataset generator (see note above)
│   │   ├── train_common.py        # Shared clean → encode → split → scale → train → evaluate pipeline
│   │   ├── train_diabetes.py / train_heart.py / train_kidney.py / train_liver.py
│   │   ├── train_all.py           # Runs all 4 training scripts + prints summary
│   │   ├── datasets/              # CSVs live here
│   │   └── saved_models/          # Trained .pkl models + metrics.json (generated)
│   ├── seed_db.py                 # Creates demo login + sample patients/predictions
│   └── requirements.txt
├── frontend/                      # React + Vite + Tailwind + Recharts
│   └── src/
│       ├── pages/                 # Dashboard, ClinicalDashboard, PatientSummary,
│       │                          # RiskAlerts, Analytics, MedicalReportUpload, Settings, Login
│       ├── components/            # Sidebar, Topbar, Layout, RiskBadge
│       └── api/client.js          # Axios client with JWT auth
└── README.md
```

---

## How It Works (explain this to your supervisor)

> Patient data is entered into the system through the Clinical Dashboard. The
> data is cleaned and preprocessed, then passed to the trained Machine
> Learning model for that specific disease (a Logistic Regression, Decision
> Tree, or Random Forest — whichever performed best during training). The
> model outputs a prediction and confidence score, which is converted into a
> risk level (Low / Medium / High). The result is saved to the SQLite
> database and immediately reflected across the Dashboard, Risk Alerts,
> Patient Summary, and Analytics pages, all of which read live data from the
> same database.

---

## Setup & Run (local, VS Code)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Generate the datasets and train all 4 models (produces real accuracy metrics)
cd ml_training
python generate_datasets.py
python train_all.py
cd ..

# Seed the database with a demo login + sample patients
python seed_db.py

# Run the API
uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** (interactive API docs at `/docs`).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 3. Open the app

Go to **http://localhost:5173** in your browser.

**Demo login:**
- Email: `doctor@vitalsignai.com`
- Password: `Demo@123`

---

## Pages

| Page | Purpose |
|---|---|
| Dashboard | Total patients, predictions, high/low risk counts, recent activity, model performance |
| Clinical Dashboard | Select a disease, enter patient vitals, run a live AI prediction |
| Patient Summary | Search patients, view medical history and past predictions |
| Risk Alerts | High/Medium/Low risk predictions surfaced as actionable alerts |
| Analytics | Real disease/risk distribution charts, prediction trends, model accuracy/precision/recall/F1 |
| Medical Report Upload | Upload PDF/image reports (OCR/AI extraction honestly labeled "Coming Soon") |
| Settings | Profile, password change, sign out |

---

## Error Handling

- All API errors return clean JSON messages (`{"detail": "..."}`) — no raw Python
  tracebacks are ever sent to the frontend (see the global exception handler in `main.py`).
- Missing/untrained models return HTTP 503 with a clear "model not trained yet" message
  instead of crashing.
- Invalid prediction inputs return HTTP 400 with the specific field that's wrong.
- Expired/invalid login sessions redirect back to `/login` automatically.

## Disclaimer shown in the app

> "This result is an AI-based risk prediction for educational purposes and is not a
> medical diagnosis."

---

## Known Limitations (be upfront about these with your supervisor)

- **Datasets are synthetic** (schema-matched to the real ones) because this build
  environment had no internet access — see the note at the top.
- **OCR / automatic report data extraction is not implemented** — file upload works,
  but analysis is honestly labeled "Coming Soon" rather than faked.
- This is a demo-grade auth system (JWT + bcrypt), not a HIPAA-compliant production system.
