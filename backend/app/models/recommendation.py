"""
Recommendation Pydantic model for MongoDB document mapping.
"""
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Any
from bson import ObjectId


class RecommendationModel(BaseModel):
    id: str | None = None
    user_id: str
    name: str
    education: str
    college: str
    cgpa: float
    years_of_experience: int
    skills: list[str]
    interests: list[str]
    career_goal: str
    preferred_industry: str
    preferred_location: str
    expected_salary: str
    recommendation: dict | None = None   # Parsed AI JSON response
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"arbitrary_types_allowed": True}

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"})
        return data

    @classmethod
    def from_mongo(cls, doc: dict) -> "RecommendationModel":
        if doc and "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        if "user_id" in doc and isinstance(doc["user_id"], ObjectId):
            doc["user_id"] = str(doc["user_id"])
        return cls(**doc)
