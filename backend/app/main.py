"""
Career Guidance Agent — FastAPI Application Entry Point
"""
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.database.connection import connect_to_mongo, close_mongo_connection
from app.middleware.rate_limiter import limiter
from app.routers import auth, profile, recommendation
from app.utils.exceptions import AppException
from app.utils.response import error_response

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "")
DATABASE_NAME = os.getenv("DATABASE_NAME", "career_guidance")
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle: connect to DB on startup, close on shutdown."""
    logger.info("Starting Career Guidance Agent API...")
    if not MONGODB_URI:
        error_msg = "MONGODB_URI is not set in your .env file! Please copy .env.example to .env and add your MongoDB Atlas connection string."
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    await connect_to_mongo(MONGODB_URI, DATABASE_NAME)
    yield
    logger.info("Shutting down Career Guidance Agent API...")
    await close_mongo_connection()


app = FastAPI(
    title="Career Guidance Agent API",
    description="AI-powered career path recommendations using Google Gemini.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Rate Limiter ────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS ────────────────────────────────────────────────────────────────────
origins = [o.strip() for o in CORS_ORIGIN.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(recommendation.router)


# ─── Global Exception Handlers ───────────────────────────────────────────────
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.message),
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(f"Validation error: {exc.errors()}"),
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content=error_response(f"Endpoint not found: {request.url.path}"),
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Unhandled 500 error: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response("An unexpected internal server error occurred."),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response(f"Internal server error: {str(exc)}"),
    )


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "Career Guidance Agent API", "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to Career Guidance Agent API. Visit /docs for documentation."}
