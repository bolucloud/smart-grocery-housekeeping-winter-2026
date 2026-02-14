from fastapi import APIRouter, Depends
from app.api.deps import get_firebase_claims
from app.api.routes import user
from app.api.routes import recognizeItem

private_api_router = APIRouter(
    dependencies=[Depends(get_firebase_claims)]
)

private_api_router.include_router(user.router, prefix="/user",  tags=["user"])
private_api_router.include_router(recognizeItem.router, prefix="/recognize-item", tags=["recognize-item"])