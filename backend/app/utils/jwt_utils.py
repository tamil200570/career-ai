"""
JWT utility functions — create and decode access tokens.
"""
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from app.utils.exceptions import AuthenticationException
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def create_access_token(subject: str, extra_data: dict[str, Any] | None = None) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": expire,
    }
    if extra_data:
        payload.update(extra_data)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token. Raises AuthenticationException on failure."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationException("Token payload missing subject.")
        return payload
    except JWTError as e:
        raise AuthenticationException(f"Invalid or expired token: {e}")
