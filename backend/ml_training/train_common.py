"""
train_common.py
================
Shared ML pipeline used by every disease-specific training script:

  load -> clean (missing values + duplicates) -> encode categoricals ->
  select features/target -> train/test split -> scale -> train
  (Logistic Regression, Decision Tree, Random Forest) -> evaluate ->
  pick the best model by F1 score -> save model + scaler + metadata + metrics.

No accuracy numbers are ever hardcoded — everything below comes from
`sklearn.metrics` run against a real held-out test split.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix,
)

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)


def clean_dataframe(df: pd.DataFrame, zero_as_missing_cols=None) -> pd.DataFrame:
    """Remove duplicates and impute missing values (median for numeric,
    mode for categorical). Some real medical datasets encode missing
    values as 0 in physiologically-impossible columns (e.g. BloodPressure=0)
    -- treat those as missing too."""
    df = df.drop_duplicates().copy()

    if zero_as_missing_cols:
        for col in zero_as_missing_cols:
            if col in df.columns:
                df[col] = df[col].replace(0, np.nan)

    for col in df.columns:
        if not pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace(["?", "nan", "None", ""], np.nan)
            if df[col].isna().any():
                mode = df[col].mode(dropna=True)
                df[col] = df[col].fillna(mode.iloc[0] if len(mode) else "unknown")
        else:
            if df[col].isna().any():
                df[col] = df[col].fillna(df[col].median())

    return df


def encode_categoricals(df: pd.DataFrame, feature_cols):
    """Label-encode any categorical feature columns; returns encoders dict
    so the same mapping can be reused at prediction time."""
    encoders = {}
    for col in feature_cols:
        if not pd.api.types.is_numeric_dtype(df[col]):
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = {cls: int(idx) for idx, cls in enumerate(le.classes_)}
    return df, encoders


def train_and_select_best(X_train, X_test, y_train, y_test):
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=2000),
        "decision_tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "random_forest": RandomForestClassifier(
            n_estimators=200, max_depth=8, random_state=42
        ),
    }

    results = {}
    fitted = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        results[name] = {
            "accuracy": round(float(accuracy_score(y_test, preds)), 4),
            "precision": round(float(precision_score(y_test, preds, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, preds, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, preds, zero_division=0)), 4),
            "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
        }
        fitted[name] = model

    best_name = max(results, key=lambda n: results[n]["f1_score"])
    return best_name, fitted[best_name], results


def run_pipeline(
    disease_key: str,
    csv_filename: str,
    target_col: str,
    feature_cols: list,
    positive_label,
    zero_as_missing_cols=None,
):
    """Full pipeline for one disease. Returns the metrics dict (also
    written to saved_models/<disease>_metrics.json)."""
    csv_path = os.path.join(DATASETS_DIR, csv_filename)
    df = pd.read_csv(csv_path)

    df = clean_dataframe(df, zero_as_missing_cols=zero_as_missing_cols)

    # binary target: 1 = disease present, 0 = not present
    y = (df[target_col].astype(str) == str(positive_label)).astype(int)

    X = df[feature_cols].copy()
    X, encoders = encode_categoricals(X, feature_cols)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    best_name, best_model, all_results = train_and_select_best(
        X_train_scaled, X_test_scaled, y_train, y_test
    )

    # persist model artifacts
    joblib.dump(best_model, os.path.join(MODELS_DIR, f"{disease_key}_model.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, f"{disease_key}_scaler.pkl"))
    joblib.dump(encoders, os.path.join(MODELS_DIR, f"{disease_key}_encoders.pkl"))

    metadata = {
        "disease": disease_key,
        "feature_cols": feature_cols,
        "target_col": target_col,
        "positive_label": positive_label,
        "best_model": best_name,
        "n_rows_after_cleaning": int(len(df)),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "class_balance_positive_rate": round(float(y.mean()), 4),
        "all_model_results": all_results,
        "selected_model_metrics": all_results[best_name],
    }
    with open(os.path.join(MODELS_DIR, f"{disease_key}_metrics.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[{disease_key}] best model: {best_name} | "
          f"accuracy={all_results[best_name]['accuracy']} "
          f"f1={all_results[best_name]['f1_score']}")
    return metadata
