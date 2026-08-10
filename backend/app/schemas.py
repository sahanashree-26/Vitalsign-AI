from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    specialty: str

    class Config:
        from_attributes = True


# ---------- Patients ----------
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    medical_history: Optional[str] = ""


class PatientOut(BaseModel):
    id: int
    mrn: str
    name: str
    age: int
    gender: str
    medical_history: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Predictions ----------
class PredictionRequest(BaseModel):
    disease: str  # diabetes | heart | kidney | liver
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None   # used if patient_id not provided
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    features: Dict[str, Any]


class PredictionResult(BaseModel):
    id: int
    disease: str
    patient_id: int
    patient_name: str
    prediction: int
    risk_level: str
    confidence: float
    model_used: str
    explanation: str
    disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Reports ----------
class ReportOut(BaseModel):
    id: int
    filename: str
    file_type: str
    status: str
    patient_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
