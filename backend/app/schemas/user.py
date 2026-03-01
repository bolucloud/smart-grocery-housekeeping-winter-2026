from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreateInternal(BaseModel):
    """Intended only for internal use when user signs up."""
    email: EmailStr
    firebase_uid: str
    display_name: str | None = None


class UserUpdate(BaseModel):
    # all fields optional since we are using PATCH to update
    display_name: str | None = None


class UserReadPublic(BaseModel):
    user_id: int
    display_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserReadPrivate(BaseModel):
    user_id: int
    email: EmailStr
    display_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
