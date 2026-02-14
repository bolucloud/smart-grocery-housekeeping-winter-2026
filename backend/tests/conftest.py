import pytest
from app.schemas.firebase import FirebaseClaims

@pytest.fixture
def firebase_claims_dict() -> dict[str, str]:
    return {
        "uid": "uid123",
        "email": "user@example.com",
        "name": "User Name",
        "custom_claim": "custom_value",
    }

@pytest.fixture
def firebase_claims(firebase_claims_dict) -> FirebaseClaims:
    return FirebaseClaims.model_validate(firebase_claims_dict)
