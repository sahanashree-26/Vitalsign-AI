import json
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth as auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/patients", tags=["patients"])


def _generate_mrn(db: Session) -> str:
    while True:
        candidate = f"MRN-{random.randint(10000, 99999)}"
        if not db.query(models.Patient).filter(models.Patient.mrn == candidate).first():
            return candidate


@router.get("", response_model=list[schemas.PatientOut])
def list_patients(
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    query = db.query(models.Patient)
    if search:
        like = f"%{search}%"
        query = query.filter(
            (models.Patient.name.ilike(like)) | (models.Patient.mrn.ilike(like))
        )
    return query.order_by(models.Patient.created_at.desc()).all()


@router.post("", response_model=schemas.PatientOut)
def create_patient(
    payload: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    patient = models.Patient(
        mrn=_generate_mrn(db),
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        medical_history=payload.medical_history or "",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return patient


@router.get("/{patient_id}/summary")
def get_patient_summary(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    predictions = (
        db.query(models.Prediction)
        .filter(models.Prediction.patient_id == patient_id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )

    return {
        "patient": schemas.PatientOut.model_validate(patient),
        "previous_predictions": [
            {
                "id": p.id,
                "disease": p.disease,
                "prediction": p.prediction,
                "risk_level": p.risk_level,
                "confidence": p.confidence,
                "model_used": p.model_used,
                "input_values": json.loads(p.input_values) if p.input_values else {},
                "date": p.created_at,
            }
            for p in predictions
        ],
    }
