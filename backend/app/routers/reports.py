import os
import re
import glob
import shutil

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth as auth_utils
from ..database import get_db
from ..ml import predictor
from ..ml.predictor import ModelNotFoundError


router = APIRouter(prefix="/api/reports", tags=["reports"])


# ---------------------------------------------------------
# FILE STORAGE
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_reports")

os.makedirs(UPLOAD_DIR, exist_ok=True)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_FILE_SIZE_MB = 50


# ---------------------------------------------------------
# UPLOAD REPORT
# ---------------------------------------------------------

@router.post("/upload", response_model=schemas.ReportOut)
async def upload_report(
    file: UploadFile = File(...),
    patient_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    original_filename = os.path.basename(file.filename)

    ext = os.path.splitext(original_filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG, and PNG files are supported."
        )

    # Check patient if patient_id is provided
    if patient_id:
        patient = (
            db.query(models.Patient)
            .filter(models.Patient.id == patient_id)
            .first()
        )

        if not patient:
            raise HTTPException(
                status_code=404,
                detail="Patient not found."
            )

    # Create unique filename
    unique_prefix = os.urandom(4).hex()

    stored_filename = f"{unique_prefix}_{original_filename}"

    dest_path = os.path.join(
        UPLOAD_DIR,
        stored_filename
    )

    # Save file
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {str(exc)}"
        )

    # Check file size
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        try:
            os.remove(dest_path)
        except Exception:
            pass

        raise HTTPException(
            status_code=400,
            detail=f"File exceeds the {MAX_FILE_SIZE_MB}MB limit."
        )

    # Create database record
    report = models.MedicalReport(
        patient_id=patient_id,
        filename=original_filename,
        file_type=ext.replace(".", ""),
        status="Uploaded",
        extracted_text="",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


# ---------------------------------------------------------
# LIST REPORTS
# ---------------------------------------------------------

@router.get("", response_model=list[schemas.ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return (
        db.query(models.MedicalReport)
        .order_by(models.MedicalReport.created_at.desc())
        .all()
    )


# ---------------------------------------------------------
# FIND STORED FILE
# ---------------------------------------------------------

def _find_uploaded_file(filename: str) -> str | None:

    safe_filename = os.path.basename(filename)

    pattern = os.path.join(
        UPLOAD_DIR,
        f"*_{safe_filename}"
    )

    matches = glob.glob(pattern)

    if not matches:
        return None

    # Most recently modified matching file
    matches.sort(
        key=os.path.getmtime,
        reverse=True
    )

    return matches[0]


# ---------------------------------------------------------
# EXTRACT TEXT FROM PDF
# ---------------------------------------------------------

def _extract_pdf_text(file_path: str) -> str:

    try:
        import fitz
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail=(
                "PDF reader is not installed. "
                "Run: pip install pymupdf"
            )
        )

    try:
        document = fitz.open(file_path)

        text_parts = []

        for page in document:
            text_parts.append(page.get_text())

        document.close()

        text = "\n".join(text_parts).strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text was found in this PDF. "
                    "This may be a scanned image PDF. "
                    "Image OCR will be added separately."
                )
            )

        return text

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read PDF: {str(exc)}"
        )


# ---------------------------------------------------------
# EXTRACT VALUE USING REGEX
# ---------------------------------------------------------

def _extract_number(
    text: str,
    patterns: list[str],
    field_name: str,
):
    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if match:

            value = match.group(1)

            try:
                return float(value)
            except ValueError:
                continue

    raise ValueError(
        f"Could not find '{field_name}' in the uploaded report."
    )


# ---------------------------------------------------------
# EXTRACT DIABETES DATA
# ---------------------------------------------------------

def _extract_diabetes_features(text: str) -> dict:

    features = {}

    # Pregnancies
    features["Pregnancies"] = _extract_number(
        text,
        [
            r"Pregnancies\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Pregnancies",
    )

    # Glucose
    features["Glucose"] = _extract_number(
        text,
        [
            r"Glucose\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Glucose",
    )

    # Blood Pressure
    features["BloodPressure"] = _extract_number(
        text,
        [
            r"Blood\s*Pressure\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"BloodPressure\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Blood Pressure",
    )

    # Skin Thickness
    features["SkinThickness"] = _extract_number(
        text,
        [
            r"Skin\s*Thickness\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"SkinThickness\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Skin Thickness",
    )

    # Insulin
    features["Insulin"] = _extract_number(
        text,
        [
            r"Insulin\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Insulin",
    )

    # BMI
    features["BMI"] = _extract_number(
        text,
        [
            r"\bBMI\b\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "BMI",
    )

    # Diabetes Pedigree Function
    features["DiabetesPedigreeFunction"] = _extract_number(
        text,
        [
            r"Diabetes\s*Pedigree\s*Function\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"DiabetesPedigreeFunction\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Diabetes Pedigree Function",
    )

    # Age
    features["Age"] = _extract_number(
        text,
        [
            r"\bAge\b\s*[:\-]?\s*(\d+(?:\.\d+)?)",
        ],
        "Age",
    )

    return features


# ---------------------------------------------------------
# DETECT DISEASE
# ---------------------------------------------------------

def _detect_disease(text: str) -> str:

    lower_text = text.lower()

    diabetes_keywords = [
        "diabetes",
        "glucose",
        "insulin",
        "diabetes pedigree",
        "blood pressure",
        "bmi",
    ]

    diabetes_score = sum(
        1
        for keyword in diabetes_keywords
        if keyword in lower_text
    )

    if diabetes_score >= 2:
        return "diabetes"

    raise ValueError(
        "Could not identify a supported disease from this report. "
        "Currently supported report analysis is Diabetes."
    )


# ---------------------------------------------------------
# ANALYZE REPORT
# ---------------------------------------------------------

@router.post("/{report_id}/analyze")
def analyze_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):

    # Find report in database
    report = (
        db.query(models.MedicalReport)
        .filter(models.MedicalReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found."
        )

    # Find physical uploaded file
    file_path = _find_uploaded_file(report.filename)

    if not file_path:
        raise HTTPException(
            status_code=404,
            detail=(
                "The uploaded file could not be found on the server. "
                "Please upload the report again."
            )
        )

    # Currently PDF analysis is supported
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail=(
                "Automatic analysis currently supports text-based PDF "
                "medical reports. JPG/PNG OCR will be added next."
            )
        )

    # -----------------------------------------------------
    # STEP 1: Extract text
    # -----------------------------------------------------

    try:
        extracted_text = _extract_pdf_text(file_path)

    except HTTPException:
        report.status = "Analysis Failed"
        db.commit()
        raise

    # Save extracted text
    report.extracted_text = extracted_text
    report.status = "Text Extracted"

    db.commit()

    # -----------------------------------------------------
    # STEP 2: Detect disease
    # -----------------------------------------------------

    try:
        disease = _detect_disease(extracted_text)

    except ValueError as exc:

        report.status = "Analysis Failed"
        db.commit()

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    # -----------------------------------------------------
    # STEP 3: Extract model inputs
    # -----------------------------------------------------

    try:

        if disease == "diabetes":

            features = _extract_diabetes_features(
                extracted_text
            )

        else:
            raise ValueError(
                f"Automatic extraction for '{disease}' "
                "is not implemented yet."
            )

    except ValueError as exc:

        report.status = "Extraction Failed"
        db.commit()

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    # -----------------------------------------------------
    # STEP 4: Run ML prediction
    # -----------------------------------------------------

    try:

        result = predictor.predict(
            disease,
            features
        )

    except ModelNotFoundError as exc:

        report.status = "Model Not Available"
        db.commit()

        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    except ValueError as exc:

        report.status = "Prediction Failed"
        db.commit()

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:

        report.status = "Prediction Failed"
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}"
        )

    # -----------------------------------------------------
    # STEP 5: Mark completed
    # -----------------------------------------------------

    report.status = "Analyzed"

    db.commit()
    db.refresh(report)

    # -----------------------------------------------------
    # RETURN RESULT
    # -----------------------------------------------------

    return {
        "report_id": report.id,
        "filename": report.filename,
        "status": report.status,

        "disease": disease,

        "extracted_values": features,

        "prediction": result["prediction"],
        "risk_level": result["risk_level"],
        "confidence": result["confidence"],

        "model_used": result["model_used"],

        "explanation": result["explanation"],

        "disclaimer": result["disclaimer"],

        "message": (
            "Medical report analyzed successfully. "
            "The extracted values were sent to the trained "
            "machine-learning model."
        ),
    }