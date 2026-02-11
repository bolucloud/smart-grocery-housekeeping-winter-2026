from fastapi import APIRouter
from app.api.routes import health

public_api_router = APIRouter()

public_api_router.include_router(health.router, prefix="/health", tags=["health"])