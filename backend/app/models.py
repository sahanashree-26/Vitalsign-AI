from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    role = Column(String, default="Doctor")
    specialty = Column(String, default="General Medicine")

    # Personal profile information
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True)

    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)

    medical_history = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship(
        "Prediction",
        back_populates="patient"
    )

    reports = relationship(
        "MedicalReport",
        back_populates="patient"
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    disease = Column(
        String,
        nullable=False
    )

    input_values = Column(Text)

    # 0 = low risk
    # 1 = high risk
    prediction = Column(Integer)

    confidence = Column(Float)

    # Low | Medium | High
    risk_level = Column(String)

    model_used = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="predictions"
    )


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True
    )

    filename = Column(
        String,
        nullable=False
    )

    file_type = Column(String)

    # Uploaded | Processing | Processed | Failed
    status = Column(
        String,
        default="Uploaded"
    )

    extracted_text = Column(
        Text,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="reports"
    )