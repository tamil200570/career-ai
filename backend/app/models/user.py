"""
User Pydantic model for MongoDB document mapping.
"""
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v: Any) -> str:
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")


class UserModel(BaseModel):
    id: str | None = None
    name: str
    email: EmailStr
    password: str
    education: str | None = None
    experience: int | None = None
    skills: list[str] = Field(default_factory=list)
    bio: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    model_config = {
        "arbitrary_types_allowed": True,
    }

    def to_mongo(self) -> dict:
        return self.model_dump(exclude={"id"})

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserModel":
        if doc and "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        return cls(**doc)

    def safe_dict(self) -> dict:
        """
        Return user data without password.
        JSON mode automatically converts datetime to ISO strings.
        """
        return self.model_dump(
            exclude={"password"},
            mode="json",
        )