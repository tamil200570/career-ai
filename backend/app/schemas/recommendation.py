"""
Pydantic schemas for career recommendation requests.
"""
from pydantic import BaseModel, Field


class CareerFormRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    education: str = Field(..., min_length=2, max_length=200)
    college: str = Field(..., min_length=2, max_length=200)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    years_of_experience: int = Field(..., ge=0, le=60)
    skills: list[str] = Field(..., min_length=1, max_length=30)
    interests: list[str] = Field(..., min_length=1, max_length=20)
    career_goal: str = Field(..., min_length=5, max_length=500)
    preferred_industry: str = Field(..., min_length=2, max_length=100)
    preferred_location: str = Field(..., min_length=2, max_length=100)
    expected_salary: str = Field(..., min_length=1, max_length=50)
