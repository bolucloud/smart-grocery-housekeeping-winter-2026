from sqlalchemy.orm import Session
from app.models.user import User


class UserDAL:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, *, firebase_uid: str, email: str, display_name: str | None) -> User:
        user = User(firebase_uid=firebase_uid, email=email, display_name=display_name)
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def get_user_by_firebase_uid(self, firebase_uid: str) -> User | None:
        return self.db.query(User).filter(User.firebase_uid == firebase_uid).first()

    def get_user_by_pk(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.user_id == user_id).first()

    def delete_user(self, user: User) -> None:
        self.db.delete(user)
        self.db.flush()
