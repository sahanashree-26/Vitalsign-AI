import json
import random
import traceback

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from .. import models
from .. import schemas
from .. import auth as auth_utils

from ..database import get_db

from ..ml import predictor

from ..ml.predictor import ModelNotFoundError


router = APIRouter(
    prefix="/api/predictions",
    tags=["predictions"]
)


# ============================================================
# VALID DISEASES
# ============================================================

VALID_DISEASES = {
    "diabetes",
    "heart",
    "kidney",
    "liver",
}


# ============================================================
# GENERATE MRN
# ============================================================

def _generate_mrn(db: Session) -> str:

    while True:

        candidate = (
            f"MRN-{random.randint(10000, 99999)}"
        )

        existing = (
            db.query(models.Patient)
            .filter(
                models.Patient.mrn == candidate
            )
            .first()
        )

        if not existing:

            return candidate


# ============================================================
# GET DISEASE FIELDS
# ============================================================

@router.get("/fields/{disease}")
def get_required_fields(
    disease: str
):

    disease = disease.lower().strip()

    if disease not in VALID_DISEASES:

        raise HTTPException(
            status_code=400,
            detail="Unknown disease type."
        )

    try:

        fields = predictor.get_disease_fields(
            disease
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    metrics = {}

    try:

        metrics = predictor.get_model_metrics(
            disease
        )

    except ModelNotFoundError:

        pass

    return {

        "disease": disease,

        "fields": fields,

        "model": metrics.get(
            "best_model"
        ),

        "accuracy": (
            metrics
            .get("selected_model_metrics", {})
            .get("accuracy")
        ),
    }


# ============================================================
# CREATE PREDICTION
# ============================================================

@router.post(
    "",
    response_model=schemas.PredictionResult
)
def create_prediction(

    payload: schemas.PredictionRequest,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        auth_utils.get_current_user
    ),
):

    # ========================================================
    # 1. VALIDATE DISEASE
    # ========================================================

    disease = (
        payload.disease
        .lower()
        .strip()
    )

    if disease not in VALID_DISEASES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Disease must be one of: "
                "diabetes, heart, kidney, liver."
            )
        )

    # ========================================================
    # 2. VALIDATE FEATURES
    # ========================================================

    if not payload.features:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please provide the health "
                "assessment values."
            )
        )

    # ========================================================
    # 3. VALIDATE REQUIRED MODEL FEATURES
    # ========================================================

    required_fields = predictor.DISEASE_FEATURES[
        disease
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in payload.features
    ]

    if missing_fields:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Some required health values "
                    "are missing."
                ),

                "missing_fields": missing_fields,

                "required_fields": required_fields,
            }
        )

    # ========================================================
    # 4. FIND OR CREATE PATIENT
    # ========================================================

    patient = None

    if payload.patient_id:

        patient = (
            db.query(models.Patient)
            .filter(
                models.Patient.id
                == payload.patient_id
            )
            .first()
        )

        if not patient:

            raise HTTPException(
                status_code=404,
                detail="Patient not found."
            )

    else:

        if not payload.patient_name:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Name is required for "
                    "a new health assessment."
                )
            )

        patient = models.Patient(

            mrn=_generate_mrn(db),

            name=payload.patient_name,

            age=payload.patient_age or 0,

            gender=(
                payload.patient_gender
                or "unknown"
            ),
        )

        db.add(patient)

        db.commit()

        db.refresh(patient)

    # ========================================================
    # 5. RUN REAL ML MODEL
    # ========================================================

    try:

        print()
        print(
            "========================================"
        )

        print(
            "VITALSIGNAI - HEALTH ASSESSMENT"
        )

        print(
            "========================================"
        )

        print(
            "Disease:",
            disease
        )

        print(
            "Person:",
            patient.name
        )

        print(
            "Features:"
        )

        print(
            payload.features
        )

        print(
            "----------------------------------------"
        )

        result = predictor.predict(

            disease,

            payload.features
        )

        print(
            "Prediction:",
            result
        )

        print(
            "========================================"
        )

        print()

    except ModelNotFoundError as exc:

        print(
            "MODEL ERROR:",
            repr(exc)
        )

        raise HTTPException(

            status_code=503,

            detail=(
                "The AI model for this disease "
                "is not available yet. "
                "Please train the model first."
            )
        )

    except ValueError as exc:

        print(
            "INPUT ERROR:",
            repr(exc)
        )

        raise HTTPException(

            status_code=400,

            detail=str(exc)
        )

    except Exception as exc:

        print(
            "PREDICTION ERROR:",
            repr(exc)
        )

        traceback.print_exc()

        raise HTTPException(

            status_code=500,

            detail=(
                "Unable to complete the health "
                "assessment. Please try again."
            )
        )

    # ========================================================
    # 6. SAVE PREDICTION
    # ========================================================

    try:

        record = models.Prediction(

            patient_id=patient.id,

            disease=disease,

            input_values=json.dumps(
                payload.features
            ),

            prediction=result[
                "prediction"
            ],

            confidence=result[
                "confidence"
            ],

            risk_level=result[
                "risk_level"
            ],

            model_used=result[
                "model_used"
            ],
        )

        db.add(record)

        db.commit()

        db.refresh(record)

    except Exception as exc:

        db.rollback()

        print(
            "DATABASE ERROR:",
            repr(exc)
        )

        traceback.print_exc()

        raise HTTPException(

            status_code=500,

            detail=(
                "The prediction was generated "
                "but could not be saved."
            )
        )

    # ========================================================
    # 7. RETURN RESULT
    # ========================================================

    return schemas.PredictionResult(

        id=record.id,

        disease=disease,

        patient_id=patient.id,

        patient_name=patient.name,

        prediction=result[
            "prediction"
        ],

        risk_level=result[
            "risk_level"
        ],

        confidence=result[
            "confidence"
        ],

        model_used=result[
            "model_used"
        ],

        explanation=result[
            "explanation"
        ],

        disclaimer=result[
            "disclaimer"
        ],

        created_at=record.created_at,
    )


# ============================================================
# RECENT PREDICTIONS
# ============================================================

@router.get("/recent")
def recent_predictions(

    limit: int = 10,

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        auth_utils.get_current_user
    ),
):

    if limit < 1:
        limit = 1

    if limit > 100:
        limit = 100

    rows = (

        db.query(models.Prediction)

        .join(models.Patient)

        .order_by(
            models.Prediction.created_at.desc()
        )

        .limit(limit)

        .all()
    )

    return [

        {
            "id": row.id,

            "patient_name": row.patient.name,

            "disease": row.disease,

            "risk_level": row.risk_level,

            "confidence": row.confidence,

            "date": row.created_at,
        }

        for row in rows
    ]