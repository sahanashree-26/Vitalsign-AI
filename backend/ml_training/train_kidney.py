"""Train the Chronic Kidney Disease risk model (UCI CKD schema)."""
from train_common import run_pipeline

FEATURES = [
    "age", "bp", "sg", "al", "su", "bgr", "bu", "sc", "sod", "pot",
    "hemo", "wbcc", "rbcc", "htn", "dm", "cad", "appet", "pe", "ane",
]

if __name__ == "__main__":
    run_pipeline(
        disease_key="kidney",
        csv_filename="kidney.csv",
        target_col="classification",
        feature_cols=FEATURES,
        positive_label="ckd",
    )
