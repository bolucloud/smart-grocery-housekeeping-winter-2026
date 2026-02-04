import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import ValidationError

from firebase_admin import auth
from app.auth.firebase import decode_token
from app.schemas.firebase import FirebaseClaims

from app.models.user import User
from app.data_access.user_dal import UserDAL
from app.data_access.deps import get_user_dal

logger = logging.getLogger(__name__)

parse_auth = HTTPBearer(auto_error=False)


def get_bearer_token(
    auth_credentials: HTTPAuthorizationCredentials | None = Depends(parse_auth)
) -> str:
    if not auth_credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    if auth_credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid scheme"
        )
    
    if not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing credentials"
        )
    
    return auth_credentials.credentials


def get_firebase_claims(id_token: str = Depends(get_bearer_token)) -> FirebaseClaims:
    try:
        return decode_token(id_token)
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token has been revoked"
        )
    except auth.UserDisabledError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token is invalid"
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token is expired"
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token is malformed"
        )
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID token claims failed validation"
        )
    except Exception:
        logger.exception("Unexpected error occurred while verifying Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error with authentication service"
        )


def get_current_user(
    claims: FirebaseClaims = Depends(get_firebase_claims),
    user_dal: UserDAL = Depends(get_user_dal)
) -> User:
    firebase_uid = claims.uid
    user = user_dal.get_user_by_firebase_uid(firebase_uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
        