import pytest
from unittest.mock import Mock, create_autospec

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api import deps as api_deps
from app.data_access.user_dal import UserDAL

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
