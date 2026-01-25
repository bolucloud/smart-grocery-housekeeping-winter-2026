from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

app = FastAPI()

# Create tables
# Looks at all models that inherit from Base
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "ok", "message": "FastAPI is running"}


# Each request gets its own DB session
# FastAPI injects it automatically via Depends
@app.get("/hello")
def db_check(db: Session = Depends(get_db)):
    # if this returns, DB session is working
    return {"db_connected": True, "message": "Hello- world"}

@app.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(email=payload.email, display_name=payload.display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    # if this returns, DB session is working
    return {"db_connected": True}
