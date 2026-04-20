import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.tryon import router as tryon_router

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(title="Virtual Try-On PoC API")

# PoC CORS setup: keep permissive for local frontend and external static host.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(tryon_router)


@app.on_event("startup")
async def log_startup() -> None:
    logger.info(
        "API starting with VTO_USE_VERTEX=%s GOOGLE_CLOUD_PROJECT=%s GOOGLE_CLOUD_LOCATION=%s VTO_AUTH_MODE=%s",
        os.getenv("VTO_USE_VERTEX", "false"),
        os.getenv("GOOGLE_CLOUD_PROJECT", ""),
        os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        os.getenv("VTO_AUTH_MODE", "adc"),
    )


