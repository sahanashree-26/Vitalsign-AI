from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, auth as auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/risk-alerts", tags=["risk-alerts"])


@router.get("")
def get_risk_alerts(
    level: str | None = None,  # High | Medium | Low
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    query = db.query(models.Prediction).join(models.Patient)
    if level:
        query = query.filter(models.Prediction.risk_level == level.capitalize())
    else:
        query = query.filter(models.Prediction.risk_level.in_(["High", "Medium", "Low"]))

    rows = query.order_by(models.Prediction.created_at.desc()).limit(100).all()

    alerts = [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": r.patient.name,
            "mrn": r.patient.mrn,
            "disease": r.disease,
            "risk_level": r.risk_level,
            "confidence": r.confidence,
            "date": r.created_at,
            "status": "Unresolved",
        }
        for r in rows
    ]

    counts = {
        "High": sum(1 for a in alerts if a["risk_level"] == "High"),
        "Medium": sum(1 for a in alerts if a["risk_level"] == "Medium"),
        "Low": sum(1 for a in alerts if a["risk_level"] == "Low"),
    }

    return {"alerts": alerts, "counts": counts}
