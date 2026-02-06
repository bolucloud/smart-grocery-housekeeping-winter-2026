from fastapi import APIRouter
from app.api.routes import health, user, recognizeItem

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(user.router, prefix="/user",  tags=["user"])
api_router.include_router(recognizeItem.router, prefix="/recognizeItem", tags=["recognizeItem"])
