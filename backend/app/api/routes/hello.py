from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db



router = APIRouter()

@router.get("/hello")
def hello():
    return {"status": "ok", "message": "Hello World"}
