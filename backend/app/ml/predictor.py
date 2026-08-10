"""
VitalSignAI - ML Predictor

Loads the trained disease models and performs real predictions.

The models are trained using:
    Logistic Regression
    Decision Tree
    Random Forest

The best model is selected during training using F1 score.

This file does NOT train models.
It only loads the saved model, scaler and encoders and performs
prediction using the exact feature order used during training.
"""

import os
import json
import joblib
import numpy as np


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    "ml_training",
    "saved_models"
)


# ============================================================
# FEATURES USED DURING TRAINING
# ============================================================

DISEASE_FEATURES = {

    "diabetes": [
        "Pregnancies",
        "Glucose",
        "BloodPressure",
        "SkinThickness",
        "Insulin",
        "BMI",
        "DiabetesPedigreeFunction",
        "Age",
    ],

    "heart": [
        "age",
        "sex",
        "cp",
        "trestbps",
        "chol",
        "fbs",
        "restecg",
        "thalach",
        "exang",
        "oldpeak",
        "slope",
        "ca",
        "thal",
    ],

    "kidney": [
        "age",
        "bp",
        "sg",
        "al",
        "su",
        "bgr",
        "bu",
        "sc",
        "sod",
        "pot",
        "hemo",
        "wbcc",
        "rbcc",
        "htn",
        "dm",
        "cad",
        "appet",
        "pe",
        "ane",
    ],

    "liver": [
        "Age",
        "Gender",
        "Total_Bilirubin",
        "Direct_Bilirubin",
        "Alkaline_Phosphotase",
        "Alamine_Aminotransferase",
        "Aspartate_Aminotransferase",
        "Total_Protiens",
        "Albumin",
        "Albumin_and_Globulin_Ratio",
    ],
}


# ============================================================
# USER-FRIENDLY FIELD INFORMATION
# ============================================================

FIELD_INFO = {

    "diabetes": {
        "Pregnancies": {
            "label": "Number of Pregnancies",
            "description": "Number of times the person has been pregnant.",
            "type": "number",
            "min": 0,
            "max": 20,
        },

        "Glucose": {
            "label": "Glucose Level",
            "description": "Blood glucose concentration.",
            "type": "number",
            "min": 40,
            "max": 400,
        },

        "BloodPressure": {
            "label": "Blood Pressure",
            "description": "Diastolic blood pressure.",
            "type": "number",
            "min": 30,
            "max": 200,
        },

        "SkinThickness": {
            "label": "Skin Thickness",
            "description": "Triceps skin fold thickness.",
            "type": "number",
            "min": 1,
            "max": 100,
        },

        "Insulin": {
            "label": "Insulin Level",
            "description": "Serum insulin level.",
            "type": "number",
            "min": 1,
            "max": 1000,
        },

        "BMI": {
            "label": "BMI",
            "description": "Body Mass Index.",
            "type": "number",
            "min": 10,
            "max": 70,
        },

        "DiabetesPedigreeFunction": {
            "label": "Diabetes Family Risk",
            "description": "Diabetes pedigree function from the health data.",
            "type": "number",
            "min": 0,
            "max": 3,
            "step": 0.01,
        },

        "Age": {
            "label": "Age",
            "description": "Age in years.",
            "type": "number",
            "min": 1,
            "max": 120,
        },
    },

    "heart": {

        "age": {
            "label": "Age",
            "description": "Age in years.",
            "type": "number",
        },

        "sex": {
            "label": "Sex",
            "description": "Sex value used by the trained model.",
            "type": "number",
        },

        "cp": {
            "label": "Chest Pain Type",
            "description": "Chest pain category used by the trained model.",
            "type": "number",
        },

        "trestbps": {
            "label": "Resting Blood Pressure",
            "description": "Resting blood pressure.",
            "type": "number",
        },

        "chol": {
            "label": "Cholesterol",
            "description": "Serum cholesterol level.",
            "type": "number",
        },

        "fbs": {
            "label": "Fasting Blood Sugar",
            "description": "Fasting blood sugar indicator.",
            "type": "number",
        },

        "restecg": {
            "label": "Resting ECG",
            "description": "Resting electrocardiographic result.",
            "type": "number",
        },

        "thalach": {
            "label": "Maximum Heart Rate",
            "description": "Maximum heart rate achieved.",
            "type": "number",
        },

        "exang": {
            "label": "Exercise Angina",
            "description": "Exercise-induced angina indicator.",
            "type": "number",
        },

        "oldpeak": {
            "label": "ST Depression",
            "description": "ST depression value.",
            "type": "number",
            "step": 0.1,
        },

        "slope": {
            "label": "ST Segment Slope",
            "description": "Slope value used by the trained model.",
            "type": "number",
        },

        "ca": {
            "label": "Major Vessels",
            "description": "Number of major vessels.",
            "type": "number",
        },

        "thal": {
            "label": "Thalassemia Value",
            "description": "Thalassemia value used by the trained model.",
            "type": "number",
        },
    },

    "kidney": {
        field: {
            "label": field.replace("_", " ").title(),
            "description": f"Kidney health value: {field.replace('_', ' ')}.",
            "type": "number",
        }
        for field in [
            "age",
            "bp",
            "sg",
            "al",
            "su",
            "bgr",
            "bu",
            "sc",
            "sod",
            "pot",
            "hemo",
            "wbcc",
            "rbcc",
        ]
    },

    "liver": {
        "Age": {
            "label": "Age",
            "description": "Age in years.",
            "type": "number",
        },

        "Gender": {
            "label": "Gender",
            "description": "Gender value used by the trained model.",
            "type": "number",
        },

        "Total_Bilirubin": {
            "label": "Total Bilirubin",
            "description": "Total bilirubin level.",
            "type": "number",
        },

        "Direct_Bilirubin": {
            "label": "Direct Bilirubin",
            "description": "Direct bilirubin level.",
            "type": "number",
        },

        "Alkaline_Phosphotase": {
            "label": "Alkaline Phosphotase",
            "description": "Alkaline phosphotase level.",
            "type": "number",
        },

        "Alamine_Aminotransferase": {
            "label": "Alamine Aminotransferase",
            "description": "Alamine aminotransferase level.",
            "type": "number",
        },

        "Aspartate_Aminotransferase": {
            "label": "Aspartate Aminotransferase",
            "description": "Aspartate aminotransferase level.",
            "type": "number",
        },

        "Total_Protiens": {
            "label": "Total Proteins",
            "description": "Total protein level.",
            "type": "number",
        },

        "Albumin": {
            "label": "Albumin",
            "description": "Albumin level.",
            "type": "number",
        },

        "Albumin_and_Globulin_Ratio": {
            "label": "Albumin / Globulin Ratio",
            "description": "Albumin and globulin ratio.",
            "type": "number",
        },
    },
}


# ============================================================
# RISK FACTORS
# ============================================================

TOP_RISK_FACTOR_HINTS = {

    "diabetes": [
        "Glucose",
        "BMI",
        "Age",
        "DiabetesPedigreeFunction",
    ],

    "heart": [
        "chol",
        "trestbps",
        "oldpeak",
        "ca",
        "exang",
    ],

    "kidney": [
        "sc",
        "bu",
        "hemo",
        "al",
    ],

    "liver": [
        "Total_Bilirubin",
        "Alamine_Aminotransferase",
        "Aspartate_Aminotransferase",
        "Albumin",
    ],
}


# ============================================================
# DISCLAIMER
# ============================================================

DISCLAIMER = (
    "This result is an AI-based risk prediction for educational "
    "purposes only. It is not a medical diagnosis and should not "
    "replace professional medical advice."
)


# ============================================================
# MODEL CACHE
# ============================================================

_cache = {}


# ============================================================
# CUSTOM ERROR
# ============================================================

class ModelNotFoundError(Exception):
    pass


# ============================================================
# LOAD MODEL
# ============================================================

def _load_artifacts(disease: str):

    if disease in _cache:
        return _cache[disease]

    model_path = os.path.join(
        MODELS_DIR,
        f"{disease}_model.pkl"
    )

    scaler_path = os.path.join(
        MODELS_DIR,
        f"{disease}_scaler.pkl"
    )

    encoders_path = os.path.join(
        MODELS_DIR,
        f"{disease}_encoders.pkl"
    )

    metrics_path = os.path.join(
        MODELS_DIR,
        f"{disease}_metrics.json"
    )

    if not os.path.exists(model_path):

        raise ModelNotFoundError(
            f"No trained model found for '{disease}'. "
            f"Please train the model first."
        )

    if not os.path.exists(scaler_path):

        raise ModelNotFoundError(
            f"Scaler for '{disease}' was not found."
        )

    model = joblib.load(model_path)

    scaler = joblib.load(scaler_path)

    encoders = {}

    if os.path.exists(encoders_path):
        encoders = joblib.load(encoders_path)

    metrics = {}

    if os.path.exists(metrics_path):

        with open(
            metrics_path,
            "r",
            encoding="utf-8"
        ) as file:

            metrics = json.load(file)

    artifacts = {
        "model": model,
        "scaler": scaler,
        "encoders": encoders,
        "metrics": metrics,
    }

    _cache[disease] = artifacts

    return artifacts


# ============================================================
# MODEL METRICS
# ============================================================

def get_model_metrics(disease: str) -> dict:

    disease = disease.lower().strip()

    return _load_artifacts(disease)["metrics"]


# ============================================================
# AVAILABLE DISEASES
# ============================================================

def list_available_diseases():

    available = []

    for disease in DISEASE_FEATURES:

        model_path = os.path.join(
            MODELS_DIR,
            f"{disease}_model.pkl"
        )

        if os.path.exists(model_path):
            available.append(disease)

    return available


# ============================================================
# GET USER-FRIENDLY FIELDS
# ============================================================

def get_disease_fields(disease: str):

    disease = disease.lower().strip()

    if disease not in DISEASE_FEATURES:
        raise ValueError(
            f"Unknown disease type: {disease}"
        )

    fields = []

    for feature in DISEASE_FEATURES[disease]:

        info = FIELD_INFO.get(disease, {}).get(
            feature,
            {
                "label": feature.replace("_", " "),
                "description": "",
                "type": "number",
            }
        )

        fields.append({
            "name": feature,
            **info,
            "required": True,
        })

    return fields


# ============================================================
# ENCODE INPUT
# ============================================================

def _encode_input(
    disease: str,
    features: dict,
    encoders: dict
):

    feature_cols = DISEASE_FEATURES[disease]

    row = []

    for col in feature_cols:

        if col not in features:

            raise ValueError(
                f"Missing required field: {col}"
            )

        value = features[col]

        if col in encoders:

            mapping = encoders[col]

            key = str(value)

            if key not in mapping:

                raise ValueError(
                    f"Invalid value for '{col}': {value}"
                )

            row.append(mapping[key])

        else:

            try:

                row.append(float(value))

            except (
                TypeError,
                ValueError
            ):

                raise ValueError(
                    f"Invalid numeric value for "
                    f"'{col}': {value}"
                )

    return np.array(row).reshape(1, -1)


# ============================================================
# PREDICT
# ============================================================

def predict(
    disease: str,
    features: dict
) -> dict:

    disease = disease.lower().strip()

    if disease not in DISEASE_FEATURES:

        raise ValueError(
            f"Unknown disease type: {disease}"
        )

    artifacts = _load_artifacts(disease)

    model = artifacts["model"]

    scaler = artifacts["scaler"]

    encoders = artifacts["encoders"]

    # ---------------------------------------------
    # Encode
    # ---------------------------------------------

    X = _encode_input(
        disease,
        features,
        encoders
    )

    # ---------------------------------------------
    # Scale
    # ---------------------------------------------

    X_scaled = scaler.transform(X)

    # ---------------------------------------------
    # Prediction
    # ---------------------------------------------

    pred_class = int(
        model.predict(X_scaled)[0]
    )

    # ---------------------------------------------
    # Confidence
    # ---------------------------------------------

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(
            X_scaled
        )[0]

        confidence = (
            float(probabilities[pred_class])
            * 100
        )

    else:

        confidence = 75.0

    confidence = round(
        confidence,
        2
    )

    # ---------------------------------------------
    # Risk
    # ---------------------------------------------

    if pred_class == 1:

        if confidence >= 70:
            risk_level = "High"

        else:
            risk_level = "Medium"

    else:

        if confidence >= 60:
            risk_level = "Low"

        else:
            risk_level = "Medium"

    # ---------------------------------------------
    # Explanation
    # ---------------------------------------------

    hints = []

    for factor in TOP_RISK_FACTOR_HINTS.get(
        disease,
        []
    ):

        if factor in features:
            hints.append(factor)

    if pred_class == 1:

        if hints:

            readable_hints = ", ".join(
                factor.replace("_", " ")
                for factor in hints[:3]
            )

            explanation = (
                f"The model identified a higher "
                f"predicted risk based on the supplied "
                f"health values. Important factors "
                f"considered include {readable_hints}."
            )

        else:

            explanation = (
                "The trained machine-learning model "
                "identified a higher predicted risk "
                "from the supplied health data."
            )

    else:

        explanation = (
            "The trained machine-learning model "
            "did not identify a high predicted risk "
            "from the supplied health data."
        )

    # ---------------------------------------------
    # Model name
    # ---------------------------------------------

    best_model_name = artifacts[
        "metrics"
    ].get(
        "best_model",
        type(model).__name__
    )

    # ---------------------------------------------
    # Accuracy
    # ---------------------------------------------

    model_accuracy = artifacts[
        "metrics"
    ].get(
        "selected_model_metrics",
        {}
    ).get(
        "accuracy"
    )

    # ---------------------------------------------
    # Return
    # ---------------------------------------------

    return {

        "prediction": pred_class,

        "risk_level": risk_level,

        "confidence": confidence,

        "model_used": best_model_name,

        "model_accuracy": (
            round(model_accuracy * 100, 2)
            if model_accuracy is not None
            else None
        ),

        "explanation": explanation,

        "disclaimer": DISCLAIMER,
    }