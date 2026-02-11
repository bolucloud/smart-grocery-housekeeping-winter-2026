from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.user import User


class UserDAL:
    """SQLAlchemy-backed data access helpers for `User` records."""
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, *, firebase_uid: str, email: str, display_name: str | None) -> User:
        """Create and persist a new user."""
        user = User(firebase_uid=firebase_uid, email=email, display_name=display_name)
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user
    
    def create_user_or_get_existing(
        self, *, firebase_uid: str, email: str, display_name: str | None
    ) -> tuple[User, bool]:
        """
        Attempt to create a user. If a concurrent request creates it first,
        recover by rolling back and returning the existing row.

        If the row does not exist, we may have a conflict on another column,
        such as email, in which case we re-raise the exception.
        """
        try:
            user = self.create_user(
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name,
            )
            return user, True
        except IntegrityError:
            self.db.rollback()
            existing = self.get_user_by_firebase_uid(firebase_uid)
            if existing:
                return existing, False
            raise

    def get_user_by_firebase_uid(self, firebase_uid: str) -> User | None:
        """Return the user matching `firebase_uid`, or None if not found."""
        return self.db.query(User).filter(User.firebase_uid == firebase_uid).first()

    def get_user_by_pk(self, user_id: int) -> User | None:
        """Return the user by primary key, or None if not found."""
        return self.db.query(User).filter(User.user_id == user_id).first()

    def delete_user(self, user: User) -> None:
        """Delete the given user."""
        self.db.delete(user)
        self.db.flush()
