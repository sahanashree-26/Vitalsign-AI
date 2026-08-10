from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, auth as auth_utils
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    specialty: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/profile")
def get_profile(current_user: models.User = Depends(auth_utils.get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "specialty": current_user.specialty,
    }


@router.put("/profile")
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if payload.name:
        current_user.name = payload.name
    if payload.specialty:
        current_user.specialty = payload.specialty
    db.commit()
    return {"message": "Profile updated successfully."}


@router.put("/password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if not auth_utils.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    current_user.password_hash = auth_utils.hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
