from fastapi import APIRouter
from app.api.routes import health, user, hello

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(user.router, tags=["user"])
api_router.include_router(hello.router, tags=["hello"])

