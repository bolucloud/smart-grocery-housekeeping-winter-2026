import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.api.public_router import public_api_router
from app.api.protected_router import private_api_router
from app.db.init_db import init_db

from app.auth.firebase import init_firebase
from google.auth.exceptions import DefaultCredentialsError

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- app startup ---
    try:
        init_firebase()
    except DefaultCredentialsError as e:
        logger.exception(
            "Firebase init failed: Application Default Credentials not found. "
            "Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON file (local dev), "
            "or configure ADC in the runtime environment."
        )
        raise RuntimeError("Firebase initialization failed; see logs for details.") from e
    except Exception as e:
        logger.exception("Firebase init failed during startup.")
        raise RuntimeError("Firebase initialization failed; see logs for details.") from e
    # TEMP for learning (later use Alembic)
    init_db()
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
