"""
Authentication router — /api/auth/register and /api/auth/login
"""
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, login_user
from app.middleware.auth_middleware import get_db
from app.middleware.rate_limiter import limiter
from app.utils.response import success_response, error_response
from app.utils.exceptions import ConflictException, AuthenticationException, DatabaseException

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
@limiter.limit("10/minute")
async def register(
    request: Request,
    body: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        result = await register_user(db, body)
        return JSONResponse(
            status_code=201,
            content=success_response("Registration successful.", result),
        )
    except ConflictException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=error_response(e.message),
        )
    except DatabaseException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=error_response(e.message),
        )


@router.post("/login")
@limiter.limit("20/minute")
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        result = await login_user(db, body)
        return JSONResponse(
            status_code=200,
            content=success_response("Login successful.", result),
        )
    except AuthenticationException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=error_response(e.message),
        )
    except DatabaseException as e:
        return JSONResponse(
            status_code=e.status_code,
            content=error_response(e.message),
        )
