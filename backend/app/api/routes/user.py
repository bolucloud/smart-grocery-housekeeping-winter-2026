from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter()

# TODO: consider updating route pattern after introducing auth to a self-fetch pattern e.g., GET /user
# instead of GET /user/{user_id} so authentication doesn't depend on fragile additional checks outside of middleware
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(email=payload.email, display_name=payload.display_name)
    db.add(user)
    # just assuming a 409 right now for simplicity
    # need to make more robust, potentially check pg constraints
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email already exists"
        )
    db.refresh(user)
    return user


# TODO: consider updating route pattern after introducing auth (same logic as above)
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
    # 200 pattern where we return object for now to make for a better demo
    return {
        "deleted": user_id
    }
