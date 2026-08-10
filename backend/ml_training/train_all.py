"""Train all 4 disease models in one go and print a summary comparison."""
from train_common import run_pipeline
import train_diabetes as d
import train_heart as h
import train_kidney as k
import train_liver as lv

if __name__ == "__main__":
    results = {}
    results["diabetes"] = run_pipeline("diabetes", "diabetes.csv", "Outcome", d.FEATURES, 1,
                                        zero_as_missing_cols=["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"])
    results["heart"] = run_pipeline("heart", "heart.csv", "target", h.FEATURES, 1)
    results["kidney"] = run_pipeline("kidney", "kidney.csv", "classification", k.FEATURES, "ckd")
    results["liver"] = run_pipeline("liver", "liver.csv", "Dataset", lv.FEATURES, 1)

    print("\n=== VitalSignAI — Model Training Summary ===")
    print(f"{'Disease':<10} {'Best Model':<22} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1':<10}")
    for disease, meta in results.items():
        m = meta["selected_model_metrics"]
        print(f"{disease:<10} {meta['best_model']:<22} {m['accuracy']:<10} {m['precision']:<10} {m['recall']:<10} {m['f1_score']:<10}")
