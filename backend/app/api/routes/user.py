from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.user import User
from app.schemas.user import UserPrivate

from app.api.deps import get_current_user, get_firebase_claims
from app.schemas.firebase import FirebaseClaims
from app.data_access.user_dal import UserDAL
from app.data_access.deps import get_user_dal

router = APIRouter()

@router.get("/profile", response_model=UserPrivate)
def get_private_profile(user: User = Depends(get_current_user)):
    return user


@router.post("/", response_model=UserPrivate, status_code=status.HTTP_201_CREATED)
def create_user(
    claims: FirebaseClaims = Depends(get_firebase_claims),
    userDAL: UserDAL = Depends(get_user_dal)
):
    """Sign-up endpoint -- still requires Firebase idToken in Authorization header."""
    firebase_uid = claims.uid
    existing_user = userDAL.get_user_by_firebase_uid(firebase_uid)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists"
        )
    
    if not claims.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email required in claim; choose alternate auth method"
        )
    
    # TODO:
    # check if email is verified?
    # need to handle possible race-condition if two concurrent requests for a new user come in?
    return userDAL.create_user(
        firebase_uid=firebase_uid,
        email=str(claims.email), # technically email is typed as EmailStr
        display_name=claims.name,
    )


# TODO: consider updating route pattern after introducing auth (same logic as above)
@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user: User = Depends(get_current_user),
    userDAL: UserDAL = Depends(get_user_dal)
) -> None:
    userDAL.delete_user(user)
    return None
