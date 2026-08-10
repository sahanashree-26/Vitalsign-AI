"""Train the Heart Disease risk model (Cleveland Heart Disease schema)."""
from train_common import run_pipeline

FEATURES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal",
]

if __name__ == "__main__":
    run_pipeline(
        disease_key="heart",
        csv_filename="heart.csv",
        target_col="target",
        feature_cols=FEATURES,
        positive_label=1,
    )
