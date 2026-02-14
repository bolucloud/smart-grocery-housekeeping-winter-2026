from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.data_access.user_dal import UserDAL


def get_user_dal(db: Session = Depends(get_db)) -> UserDAL:
    return UserDAL(db)
