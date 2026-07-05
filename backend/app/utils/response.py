"""
Standardized API response envelope.
Every response follows: { success, message, data, timestamp }
"""
from datetime import datetime, timezone
from typing import Any


def success_response(
    message: str,
    data: Any = None,
    status_code: int = 200,
) -> dict:
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error_response(
    message: str,
    data: Any = None,
    status_code: int = 400,
) -> dict:
    return {
        "success": False,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
