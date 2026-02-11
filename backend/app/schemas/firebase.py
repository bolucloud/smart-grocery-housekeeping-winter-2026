from pydantic import BaseModel, EmailStr, ConfigDict


class FirebaseClaims(BaseModel):
    uid: str
    email: EmailStr | None = None
    name: str | None = None

    model_config = ConfigDict(extra="allow")
