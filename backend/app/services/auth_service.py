"""
Authentication service — register, login, and password management.
"""
from datetime import datetime, timezone
import logging
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserModel
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.exceptions import (
    AuthenticationException,
    ConflictException,
    NotFoundException,
    DatabaseException,
)
from app.utils.jwt_utils import create_access_token

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS_COLLECTION = "users"


def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


async def register_user(db: AsyncIOMotorDatabase, data: RegisterRequest) -> dict:
    """Register a new user. Raises ConflictException if email already exists."""
    try:
        existing = await db[USERS_COLLECTION].find_one({"email": data.email})
        if existing:
            raise ConflictException("An account with this email already exists.")

        user = UserModel(
            name=data.name,
            email=data.email,
            password=_hash_password(data.password),
            education=data.education,
            experience=data.experience,
        )
        result = await db[USERS_COLLECTION].insert_one(user.to_mongo())
        user.id = str(result.inserted_id)

        token = create_access_token(subject=user.id)
        return {"token": token, "user": user.safe_dict()}
    except ConflictException:
        raise
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise DatabaseException(f"Registration failed: {e}")


async def login_user(db: AsyncIOMotorDatabase, data: LoginRequest) -> dict:
    """Authenticate user and return JWT token."""
    try:
        doc = await db[USERS_COLLECTION].find_one({"email": data.email})
        if not doc:
            raise AuthenticationException("Invalid email or password.")

        if not _verify_password(data.password, doc["password"]):
            raise AuthenticationException("Invalid email or password.")

        user = UserModel.from_mongo(doc)
        token = create_access_token(subject=user.id)
        return {"token": token, "user": user.safe_dict()}
    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise DatabaseException(f"Login failed: {e}")


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> UserModel:
    """Fetch a user document by ID."""
    from bson import ObjectId
    try:
        doc = await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
        if not doc:
            raise NotFoundException("User not found.")
        return UserModel.from_mongo(doc)
    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise DatabaseException(f"Could not fetch user: {e}")


async def update_user_profile(
    db: AsyncIOMotorDatabase, user_id: str, update_data: dict
) -> UserModel:
    """Update user profile fields."""
    from bson import ObjectId
    try:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await db[USERS_COLLECTION].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
        )
        return await get_user_by_id(db, user_id)
    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        raise DatabaseException(f"Could not update profile: {e}")


async def change_user_password(
    db: AsyncIOMotorDatabase, user_id: str, current_password: str, new_password: str
) -> bool:
    """Verify current password and update to new hashed password."""
    user = await get_user_by_id(db, user_id)
    if not _verify_password(current_password, user.password):
        raise AuthenticationException("Current password is incorrect.")

    new_hashed = _hash_password(new_password)
    from bson import ObjectId
    await db[USERS_COLLECTION].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": new_hashed, "updated_at": datetime.now(timezone.utc)}},
    )
    return True
