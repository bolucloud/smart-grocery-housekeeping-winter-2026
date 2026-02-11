import pytest
from unittest.mock import Mock, create_autospec

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import ValidationError
from firebase_admin import auth

from app.api import deps as api_deps
from app.data_access.user_dal import UserDAL
from app.schemas.firebase import FirebaseClaims

TOKEN = "token123"


def test_get_bearer_token_missing_header_401():
    with pytest.raises(HTTPException) as e:
        api_deps.get_bearer_token(None)
    assert e.value.status_code == 401
    assert e.value.detail == "Missing Authorization header"


def test_get_bearer_token_wrong_scheme_401():
    creds = HTTPAuthorizationCredentials(scheme="Basic", credentials=TOKEN)
    with pytest.raises(HTTPException) as e:
        api_deps.get_bearer_token(creds)
    assert e.value.status_code == 401
    assert e.value.detail == "Invalid scheme"


def test_get_bearer_token_missing_credentials_401():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="")
    with pytest.raises(HTTPException) as e:
        api_deps.get_bearer_token(creds)
    assert e.value.status_code == 401
    assert e.value.detail == "Missing credentials"


def test_get_bearer_token_ok():
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=TOKEN)
    assert api_deps.get_bearer_token(creds) == TOKEN


def test_get_firebase_claims_ok(monkeypatch, firebase_claims):
    mock_decode_token = Mock(return_value=firebase_claims)
    monkeypatch.setattr(api_deps, "decode_token", mock_decode_token)

    got = api_deps.get_firebase_claims(TOKEN)

    mock_decode_token.assert_called_once_with(TOKEN)
    assert got == firebase_claims


def make_firebase_exception(exc_type, message: str) -> Exception:
    """
    Helper to generate Firebase exceptions because some require cause
    and signatures are not necessarily consistent across versions.
    """
    try:
        return exc_type(message)
    except TypeError:
        return exc_type(message, Exception("cause"))


@pytest.mark.parametrize(
    "exc_constructor, expected_detail",
    [
        (lambda: make_firebase_exception(auth.RevokedIdTokenError, "revoked"), "ID token has been revoked"),
        (lambda: make_firebase_exception(auth.UserDisabledError, "disabled"), "User account is disabled"),
        (lambda: make_firebase_exception(auth.InvalidIdTokenError, "invalid"), "ID token is invalid"),
        (lambda: make_firebase_exception(auth.ExpiredIdTokenError, "expired"), "ID token is expired"),
        (lambda: ValueError("malformed"), "ID token is malformed"),
    ],
)
def test_get_firebase_claims_known_failures_map_to_401(monkeypatch, exc_constructor, expected_detail):
    monkeypatch.setattr(api_deps, "decode_token", Mock(side_effect=exc_constructor()))

    with pytest.raises(HTTPException) as e:
        api_deps.get_firebase_claims(TOKEN)

    assert e.value.status_code == 401
    assert e.value.detail == expected_detail


def make_firebase_claims_validation_error() -> ValidationError:
    """
    Create a real Pydantic ValidationError by validating bad claims data.
    """
    with pytest.raises(ValidationError) as e:
        FirebaseClaims.model_validate({})  # missing required fields
    return e.value


def test_get_firebase_claims_validation_error_maps_to_401(monkeypatch):
    exc = make_firebase_claims_validation_error()
    monkeypatch.setattr(api_deps, "decode_token", Mock(side_effect=exc))

    with pytest.raises(HTTPException) as e:
        api_deps.get_firebase_claims(TOKEN)

    assert e.value.status_code == 401
    assert e.value.detail == "ID token claims failed validation"


def test_get_firebase_claims_unexpected_failure_maps_to_500(monkeypatch):
    monkeypatch.setattr(api_deps, "decode_token", Mock(side_effect=RuntimeError("some error")))

    with pytest.raises(HTTPException) as e:
        api_deps.get_firebase_claims(TOKEN)

    assert e.value.status_code == 500
    assert e.value.detail == "Error with authentication service"


def test_get_current_user_found(firebase_claims):
    user_dal = create_autospec(UserDAL, instance=True)
    expected_user = {
        "user_id": 1,
        "firebase_uid": firebase_claims.uid,
        "email": "test@example.com",
    }
    user_dal.get_user_by_firebase_uid.return_value = expected_user

    user = api_deps.get_current_user(claims=firebase_claims, user_dal=user_dal)

    user_dal.get_user_by_firebase_uid.assert_called_once_with(firebase_claims.uid)
    assert user == expected_user


def test_get_current_user_not_found_404(firebase_claims):
    user_dal = create_autospec(UserDAL, instance=True)
    user_dal.get_user_by_firebase_uid.return_value = None

    with pytest.raises(HTTPException) as e:
        api_deps.get_current_user(claims=firebase_claims, user_dal=user_dal)

    user_dal.get_user_by_firebase_uid.assert_called_once_with(firebase_claims.uid)
    assert e.value.status_code == 404
