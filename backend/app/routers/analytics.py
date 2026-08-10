from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from .. import models, auth as auth_utils
from ..database import get_db
from ..ml import predictor

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    total_predictions = db.query(func.count(models.Prediction.id)).scalar() or 0

    if total_predictions == 0:
        return {
            "message": "No prediction data available.",
            "total_predictions": 0,
            "disease_distribution": {},
            "risk_distribution": {},
            "prediction_trends": [],
            "model_performance": _model_performance(),
        }

    disease_rows = db.query(models.Prediction.disease, func.count(models.Prediction.id)).group_by(models.Prediction.disease).all()
    risk_rows = db.query(models.Prediction.risk_level, func.count(models.Prediction.id)).group_by(models.Prediction.risk_level).all()

    since = datetime.utcnow() - timedelta(days=14)
    trend_rows = (
        db.query(func.date(models.Prediction.created_at), func.count(models.Prediction.id))
        .filter(models.Prediction.created_at >= since)
        .group_by(func.date(models.Prediction.created_at))
        .order_by(func.date(models.Prediction.created_at))
        .all()
    )

    return {
        "message": None,
        "total_predictions": total_predictions,
        "disease_distribution": {d: c for d, c in disease_rows},
        "risk_distribution": {r: c for r, c in risk_rows},
        "prediction_trends": [{"date": str(d), "count": c} for d, c in trend_rows],
        "model_performance": _model_performance(),
    }


def _model_performance():
    performance = {}
    for disease in ["diabetes", "heart", "kidney", "liver"]:
        try:
            metrics = predictor.get_model_metrics(disease)
            m = metrics.get("selected_model_metrics", {})
            performance[disease] = {
                "best_model": metrics.get("best_model"),
                "accuracy": m.get("accuracy"),
                "precision": m.get("precision"),
                "recall": m.get("recall"),
                "f1_score": m.get("f1_score"),
            }
        except Exception:
            performance[disease] = None
    return performance
