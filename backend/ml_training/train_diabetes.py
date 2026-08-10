"""Train the Diabetes risk model (Pima Indians Diabetes schema)."""
from train_common import run_pipeline

FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
]

if __name__ == "__main__":
    run_pipeline(
        disease_key="diabetes",
        csv_filename="diabetes.csv",
        target_col="Outcome",
        feature_cols=FEATURES,
        positive_label=1,
        zero_as_missing_cols=["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"],
    )
