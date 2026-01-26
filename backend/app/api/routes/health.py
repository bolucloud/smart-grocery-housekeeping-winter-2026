from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.deps import get_db

router = APIRouter()

@router.get("/")
def root():
    return {"status": "ok", "message": "FastAPI is running"}

@router.get("db-check")
def db_check(db: Session = Depends(get_db)):
    # Test DB connection
    db.execute(text("SELECT 1"))
    return {"db_connected": True}
