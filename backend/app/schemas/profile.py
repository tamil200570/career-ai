"""
Pydantic schemas for user profile requests and responses.
"""
from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    education: str | None = Field(None, max_length=200)
    experience: int | None = Field(None, ge=0, le=60)
    skills: list[str] | None = None
    bio: str | None = Field(None, max_length=500)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v
