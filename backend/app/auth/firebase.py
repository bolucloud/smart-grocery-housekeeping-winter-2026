import google.auth

import firebase_admin
from firebase_admin import auth, credentials
from app.schemas.firebase import FirebaseClaims


def init_firebase() -> None:
    """
    Initialize Firebase SDK using default credentials.
    For local development define env var GOOGLE_APPLICATION_CREDENTIALS.
    """
    # get_app() raising a ValueError means the instance does not exist
    try:
        firebase_admin.get_app()
        return
    except ValueError:
        # this is here so that an exception will be raised if credentials are missing
        # this exception is caught in startup, logs some useful info, then raises a RuntimeError
        google.auth.default()
        # ApplicationDefault() is still needed to configure the app easily
        firebase_admin.initialize_app(credentials.ApplicationDefault())


def decode_token(id_token: str) -> FirebaseClaims:
    decoded = auth.verify_id_token(id_token, check_revoked=True)
    return FirebaseClaims.model_validate(decoded)
