from typing import Generator
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """This is the default approach, global commit and rollback."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_no_commit() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()