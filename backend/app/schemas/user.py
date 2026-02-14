from pydantic import BaseModel, EmailStr, ConfigDict


class UserPublic(BaseModel):
    display_name: str | None = None


class UserPrivate(BaseModel):
    user_id: int
    email: EmailStr
    display_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
