"""
Profile router — GET /api/profile, PUT /api/profile, PUT /api/profile/password
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.profile import ProfileUpdateRequest, PasswordChangeRequest
from app.services.auth_service import (
    get_user_by_id,
    update_user_profile,
    change_user_password,
)
from app.middleware.auth_middleware import get_current_user_id, get_db
from app.utils.response import success_response, error_response
from app.utils.exceptions import (
    NotFoundException,
    AuthenticationException,
    DatabaseException,
)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("")
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        user = await get_user_by_id(db, user_id)
        return JSONResponse(
            status_code=200,
            content=success_response("Profile fetched successfully.", user.safe_dict()),
        )
    except NotFoundException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except DatabaseException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))


@router.put("")
async def update_profile(
    body: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        update_data = body.model_dump(exclude_none=True)
        user = await update_user_profile(db, user_id, update_data)
        return JSONResponse(
            status_code=200,
            content=success_response("Profile updated successfully.", user.safe_dict()),
        )
    except NotFoundException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except DatabaseException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))


@router.put("/password")
async def change_password(
    body: PasswordChangeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        await change_user_password(db, user_id, body.current_password, body.new_password)
        return JSONResponse(
            status_code=200,
            content=success_response("Password changed successfully."),
        )
    except AuthenticationException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except NotFoundException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except DatabaseException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
