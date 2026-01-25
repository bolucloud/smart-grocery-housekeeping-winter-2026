from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter()

@router.get("/hello")
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return {"status": "ok", "message": "Hello World"}
