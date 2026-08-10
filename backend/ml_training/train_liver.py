"""Train the Liver Disease risk model (Indian Liver Patient Dataset schema)."""
from train_common import run_pipeline

FEATURES = [
    "Age", "Gender", "Total_Bilirubin", "Direct_Bilirubin",
    "Alkaline_Phosphotase", "Alamine_Aminotransferase",
    "Aspartate_Aminotransferase", "Total_Protiens", "Albumin",
    "Albumin_and_Globulin_Ratio",
]

if __name__ == "__main__":
    run_pipeline(
        disease_key="liver",
        csv_filename="liver.csv",
        target_col="Dataset",
        feature_cols=FEATURES,
        positive_label=1,
    )
