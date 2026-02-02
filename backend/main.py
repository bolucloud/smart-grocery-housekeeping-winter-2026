import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.api.public_router import public_api_router
from app.api.protected_router import private_api_router
from app.db.base import Base
from app.db.session import engine

from app.auth.firebase import init_firebase

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- app startup ---
    init_firebase()
    # TEMP for learning (later use Alembic)
    Base.metadata.create_all(bind=engine)
    yield
    # --- app teardown ---

app = FastAPI(lifespan=lifespan)


# TODO: add env variable to turn on if PRODUCTION?
# @app.exception_handler(Exception)
# async def catch_unhandled_exception(request: Request, e: Exception):
#     # log the error and return a generic 500 response
#     logger.exception("Error at endpoint: %s %s", request.method, request.url.path)
#     return JSONResponse(
#         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         content={"detail": "Internal server error"}
#     )

app.include_router(public_api_router)
app.include_router(private_api_router)
