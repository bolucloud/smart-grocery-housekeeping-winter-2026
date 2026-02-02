from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

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
    user_dal: UserDAL = Depends(get_user_dal)
):
    """Sign-up endpoint -- still requires Firebase idToken in Authorization header."""
    firebase_uid = claims.uid
    
    if not claims.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email required in claim; choose alternate auth method"
        )
    
    # TODO:
    # check if email is verified?
    try:
        return user_dal.create_user(
            firebase_uid=firebase_uid,
            email=claims.email,
            display_name=claims.name,
        )
    except IntegrityError:
        # could be concurrent requests causing a race condition, try to recover
        # and get the user that was created in the first request
        user_dal.db.rollback()
        existing_user = user_dal.get_user_by_firebase_uid(firebase_uid)
        if existing_user:
            return existing_user
        
        # if we make it here, it's a different issue, so return a 409
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists"
        )


# TODO: consider updating route pattern after introducing auth (same logic as above)
@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user: User = Depends(get_current_user),
    user_dal: UserDAL = Depends(get_user_dal)
) -> None:
    user_dal.delete_user(user)
