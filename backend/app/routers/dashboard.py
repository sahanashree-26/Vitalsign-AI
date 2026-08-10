from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, auth as auth_utils
from ..database import get_db
from ..ml import predictor

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    total_patients = db.query(func.count(models.Patient.id)).scalar() or 0
    total_predictions = db.query(func.count(models.Prediction.id)).scalar() or 0
    high_risk = db.query(func.count(models.Prediction.id)).filter(models.Prediction.risk_level == "High").scalar() or 0
    low_risk = db.query(func.count(models.Prediction.id)).filter(models.Prediction.risk_level == "Low").scalar() or 0
    new_reports = db.query(func.count(models.MedicalReport.id)).filter(models.MedicalReport.status == "Uploaded").scalar() or 0

    recent = (
        db.query(models.Prediction)
        .join(models.Patient)
        .order_by(models.Prediction.created_at.desc())
        .limit(6)
        .all()
    )

    disease_rows = db.query(models.Prediction.disease, func.count(models.Prediction.id)).group_by(models.Prediction.disease).all()
    disease_distribution = {d: c for d, c in disease_rows}

    # model performance -- pulled from the real saved metrics of each trained model
    model_performance = []
    for disease in ["diabetes", "heart", "kidney", "liver"]:
        try:
            metrics = predictor.get_model_metrics(disease)
            m = metrics.get("selected_model_metrics", {})
            model_performance.append({
                "disease": disease,
                "best_model": metrics.get("best_model"),
                "accuracy": m.get("accuracy"),
                "f1_score": m.get("f1_score"),
            })
        except Exception:
            model_performance.append({"disease": disease, "best_model": None, "accuracy": None, "f1_score": None})

    return {
        "total_patients": total_patients,
        "total_predictions": total_predictions,
        "high_risk_patients": high_risk,
        "low_risk_patients": low_risk,
        "new_reports_pending": new_reports,
        "recent_predictions": [
            {
                "id": r.id,
                "patient_name": r.patient.name,
                "disease": r.disease,
                "risk_level": r.risk_level,
                "confidence": r.confidence,
                "date": r.created_at,
            }
            for r in recent
        ],
        "disease_distribution": disease_distribution,
        "model_performance": model_performance,
    }
