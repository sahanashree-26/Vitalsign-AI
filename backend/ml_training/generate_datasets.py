"""
generate_datasets.py
=====================
Generates the 4 training datasets used by VitalSignAI.

IMPORTANT / HONESTY NOTE
-------------------------
This sandbox environment used to build this project has NO internet access,
so the real public datasets (Pima Indians Diabetes, Cleveland Heart Disease,
UCI Chronic Kidney Disease, UCI Indian Liver Patient Dataset) could not be
downloaded directly.

Instead, this script GENERATES synthetic data that:
  - Uses the EXACT same column names / schema as the real, well-known
    datasets, so the training scripts are 100% compatible with the real
    files.
  - Encodes realistic clinical relationships (e.g. higher glucose + BMI +
    age -> higher diabetes risk) with random noise, so the ML models learn
    genuine, non-trivial patterns instead of a lookup table.

TO USE REAL DATA INSTEAD (recommended for your final submission):
  1. Download the real CSVs:
       - diabetes.csv   -> Pima Indians Diabetes Dataset (Kaggle/UCI)
       - heart.csv      -> Cleveland Heart Disease Dataset (UCI)
       - kidney.csv     -> Chronic Kidney Disease Dataset (UCI)
       - liver.csv      -> Indian Liver Patient Dataset - ILPD (UCI)
  2. Drop them into backend/ml_training/datasets/ with those exact filenames
     and matching column names (see each file's header below).
  3. Re-run `python train_all.py`. Nothing else changes.

Every model is trained and evaluated for real on whichever CSV is present
in datasets/ — there are no hardcoded / fake accuracy numbers anywhere in
this project.
"""

import numpy as np
import pandas as pd
import os

RNG = np.random.default_rng(42)
OUT_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(OUT_DIR, exist_ok=True)

N = 1200  # rows per dataset


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def bernoulli_from_score(score, noise_std=1.1):
    z = score + RNG.normal(0, noise_std, size=len(score))
    p = sigmoid(z)
    return (RNG.random(len(p)) < p).astype(int), p


# ---------------------------------------------------------------- DIABETES
def make_diabetes():
    pregnancies = RNG.integers(0, 15, N)
    glucose = np.clip(RNG.normal(120, 32, N), 44, 200)
    bp = np.clip(RNG.normal(69, 19, N), 0, 122)
    skin = np.clip(RNG.normal(20, 16, N), 0, 99)
    insulin = np.clip(RNG.normal(80, 115, N), 0, 846)
    bmi = np.clip(RNG.normal(32, 7.9, N), 0, 67)
    dpf = np.clip(RNG.normal(0.47, 0.33, N), 0.078, 2.42)
    age = RNG.integers(21, 81, N)

    score = (
        0.028 * (glucose - 120)
        + 0.05 * (bmi - 32)
        + 0.02 * (age - 33)
        + 0.6 * dpf
        + 0.05 * pregnancies
        - 2.0
    )
    outcome, _ = bernoulli_from_score(score, noise_std=0.85)

    df = pd.DataFrame({
        "Pregnancies": pregnancies,
        "Glucose": glucose.round(1),
        "BloodPressure": bp.round(1),
        "SkinThickness": skin.round(1),
        "Insulin": insulin.round(1),
        "BMI": bmi.round(1),
        "DiabetesPedigreeFunction": dpf.round(3),
        "Age": age,
        "Outcome": outcome,
    })
    # inject a few missing values / zeros the way the real dataset has them
    for col in ["SkinThickness", "Insulin", "BloodPressure"]:
        idx = RNG.choice(N, size=int(N * 0.05), replace=False)
        df.loc[idx, col] = 0
    df.to_csv(os.path.join(OUT_DIR, "diabetes.csv"), index=False)
    print("diabetes.csv written:", df.shape, "positive rate:", df.Outcome.mean().round(3))


# ------------------------------------------------------------ HEART DISEASE
def make_heart():
    age = RNG.integers(29, 78, N)
    sex = RNG.integers(0, 2, N)  # 1 = male
    cp = RNG.integers(0, 4, N)   # chest pain type
    trestbps = np.clip(RNG.normal(131, 17.5, N), 94, 200)
    chol = np.clip(RNG.normal(246, 51.8, N), 126, 564)
    fbs = (RNG.random(N) < 0.15).astype(int)
    restecg = RNG.integers(0, 3, N)
    thalach = np.clip(RNG.normal(150, 23, N) - 0.4 * (age - 50), 71, 202)
    exang = (RNG.random(N) < 0.33).astype(int)
    oldpeak = np.clip(RNG.exponential(1.0, N), 0, 6.2)
    slope = RNG.integers(0, 3, N)
    ca = RNG.integers(0, 4, N)
    thal = RNG.integers(0, 3, N)

    score = (
        0.035 * (age - 54)
        + 0.55 * sex
        + 0.35 * cp
        + 0.02 * (trestbps - 131)
        + 0.01 * (chol - 246)
        + 0.5 * exang
        + 0.4 * oldpeak
        + 0.45 * ca
        - 0.02 * (thalach - 150)
        - 2.3
    )
    target, _ = bernoulli_from_score(score, noise_std=0.6)

    df = pd.DataFrame({
        "age": age, "sex": sex, "cp": cp,
        "trestbps": trestbps.round(1), "chol": chol.round(1),
        "fbs": fbs, "restecg": restecg, "thalach": thalach.round(1),
        "exang": exang, "oldpeak": oldpeak.round(2), "slope": slope,
        "ca": ca, "thal": thal, "target": target,
    })
    df.to_csv(os.path.join(OUT_DIR, "heart.csv"), index=False)
    print("heart.csv written:", df.shape, "positive rate:", df.target.mean().round(3))


# ------------------------------------------------------------ KIDNEY DISEASE
def make_kidney():
    age = RNG.integers(2, 90, N)
    bp = np.clip(RNG.normal(76, 13.5, N), 50, 180)
    sg = RNG.choice([1.005, 1.010, 1.015, 1.020, 1.025], N)
    al = RNG.integers(0, 5, N)
    su = RNG.integers(0, 5, N)
    bgr = np.clip(RNG.normal(148, 74, N), 22, 490)
    bu = np.clip(RNG.normal(57, 50, N), 1.5, 391)
    sc = np.clip(RNG.exponential(2.0, N) + 0.4, 0.4, 76)
    sod = np.clip(RNG.normal(137, 10, N), 4.5, 163)
    pot = np.clip(RNG.normal(4.6, 3.2, N), 2.5, 47)
    hemo = np.clip(RNG.normal(12.5, 2.9, N), 3.1, 17.8)
    wbcc = np.clip(RNG.normal(8400, 2900, N), 2200, 26400)
    rbcc = np.clip(RNG.normal(4.7, 1.0, N), 2.1, 8.0)
    htn = (RNG.random(N) < 0.37).astype(int)
    dm = (RNG.random(N) < 0.34).astype(int)
    cad = (RNG.random(N) < 0.15).astype(int)
    appet_poor = (RNG.random(N) < 0.2).astype(int)
    pe = (RNG.random(N) < 0.19).astype(int)
    ane = (RNG.random(N) < 0.15).astype(int)

    score = (
        0.03 * (sc - 3)
        + 0.015 * (bu - 57)
        - 0.25 * (hemo - 12.5)
        + 0.5 * al
        + 0.9 * htn
        + 0.7 * dm
        + 0.6 * appet_poor
        + 0.5 * ane
        + 0.02 * (age - 45)
        - 2.2
    )
    classification, _ = bernoulli_from_score(score, noise_std=0.35)
    label = np.where(classification == 1, "ckd", "notckd")

    df = pd.DataFrame({
        "age": age, "bp": bp.round(1), "sg": sg, "al": al, "su": su,
        "bgr": bgr.round(1), "bu": bu.round(1), "sc": sc.round(2),
        "sod": sod.round(1), "pot": pot.round(2), "hemo": hemo.round(1),
        "wbcc": wbcc.round(0), "rbcc": rbcc.round(2),
        "htn": np.where(htn == 1, "yes", "no"),
        "dm": np.where(dm == 1, "yes", "no"),
        "cad": np.where(cad == 1, "yes", "no"),
        "appet": np.where(appet_poor == 1, "poor", "good"),
        "pe": np.where(pe == 1, "yes", "no"),
        "ane": np.where(ane == 1, "yes", "no"),
        "classification": label,
    })
    df.to_csv(os.path.join(OUT_DIR, "kidney.csv"), index=False)
    print("kidney.csv written:", df.shape, "ckd rate:", (df.classification == "ckd").mean().round(3))


# ------------------------------------------------------------- LIVER DISEASE
def make_liver():
    age = RNG.integers(4, 90, N)
    gender = RNG.choice(["Male", "Female"], N, p=[0.76, 0.24])
    tb = np.clip(RNG.exponential(1.5, N) + 0.4, 0.4, 75)
    db = np.clip(tb * RNG.uniform(0.2, 0.6, N), 0.1, 19.7)
    alkphos = np.clip(RNG.normal(290, 240, N), 63, 2110)
    sgpt = np.clip(RNG.exponential(45, N) + 10, 10, 2000)
    sgot = np.clip(RNG.exponential(55, N) + 10, 10, 4929)
    tp = np.clip(RNG.normal(6.5, 1.1, N), 2.7, 9.6)
    alb = np.clip(RNG.normal(3.1, 0.8, N), 0.9, 5.5)
    ag_ratio = np.clip(alb / np.clip(tp - alb, 0.3, None), 0.3, 2.8)

    score = (
        0.4 * (tb - 1.5)
        + 0.01 * (sgpt - 45)
        + 0.008 * (sgot - 55)
        + 0.003 * (alkphos - 290)
        - 0.6 * (alb - 3.1)
        + 0.015 * (age - 45)
        - 1.6
    )
    is_patient, _ = bernoulli_from_score(score, noise_std=0.7)
    dataset_label = np.where(is_patient == 1, 1, 2)  # ILPD convention: 1=disease, 2=no disease

    df = pd.DataFrame({
        "Age": age, "Gender": gender,
        "Total_Bilirubin": tb.round(2), "Direct_Bilirubin": db.round(2),
        "Alkaline_Phosphotase": alkphos.round(0).astype(int),
        "Alamine_Aminotransferase": sgpt.round(0).astype(int),
        "Aspartate_Aminotransferase": sgot.round(0).astype(int),
        "Total_Protiens": tp.round(2), "Albumin": alb.round(2),
        "Albumin_and_Globulin_Ratio": ag_ratio.round(2),
        "Dataset": dataset_label,
    })
    df.to_csv(os.path.join(OUT_DIR, "liver.csv"), index=False)
    print("liver.csv written:", df.shape, "patient rate:", (df.Dataset == 1).mean().round(3))


if __name__ == "__main__":
    make_diabetes()
    make_heart()
    make_kidney()
    make_liver()
    print("\nAll synthetic datasets generated in:", OUT_DIR)
