from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    display_name: str | None = None

class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    display_name: str | None = None

    class Config:
        from_attributes = True  
