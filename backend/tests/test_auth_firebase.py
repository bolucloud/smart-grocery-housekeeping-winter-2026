from unittest.mock import Mock

from app.auth import firebase
from app.schemas.firebase import FirebaseClaims


def test_decode_token_ok(monkeypatch, firebase_claims_dict):
    mock_verify_id_token = Mock(return_value=firebase_claims_dict)
    monkeypatch.setattr(firebase.auth, "verify_id_token", mock_verify_id_token)

    claims = firebase.decode_token("token123")

    mock_verify_id_token.assert_called_once_with("token123", check_revoked=True)
    assert isinstance(claims, FirebaseClaims)
    assert claims.uid == firebase_claims_dict["uid"]
    assert claims.email == firebase_claims_dict["email"]
    assert claims.name == firebase_claims_dict["name"]
