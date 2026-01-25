from fastapi import FastAPI

from app.api.router import api_router
from app.db.base import Base
from app.db.session import engine

app = FastAPI()

# TEMP for learning (later use Alembic)
Base.metadata.create_all(bind=engine)

app.include_router(api_router)
