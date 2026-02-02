import firebase_admin
from firebase_admin import auth, credentials
from app.schemas.firebase import FirebaseClaims


def init_firebase() -> None:
    """
    Initialize Firebase SDK using default credentials.
    For local development define env var GOOGLE_APPLICATION_CREDENTIALS.
    """
    # unfortunately firebase_admin does not expose a "public" field here
    # but this check is needed to make the initialization idempotent
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.ApplicationDefault())


def decode_token(id_token: str) -> FirebaseClaims:
    # not checking if token is revoked right now to avoid unnecessary network calls
    decoded = auth.verify_id_token(id_token)
    return FirebaseClaims.model_validate(decoded)