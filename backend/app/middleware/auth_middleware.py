"""
FastAPI dependency — extract and validate the JWT bearer token from requests.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.utils.jwt_utils import decode_access_token
from app.utils.exceptions import AuthenticationException
from app.database.connection import get_database

bearer_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    FastAPI dependency that extracts the user_id from the JWT token.
    Raises HTTP 401 if the token is missing, malformed, or expired.
    """
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )
        return user_id
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e.message),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency to inject the database instance."""
    return get_database()
