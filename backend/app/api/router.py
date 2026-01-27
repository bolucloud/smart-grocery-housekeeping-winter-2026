from fastapi import APIRouter
from app.api.routes import health, user

api_router = APIRouter()

api_router.include_router(health.router, prefix="/db-check", tags=["health"])
api_router.include_router(user.router, prefix="/user",  tags=["user"])


