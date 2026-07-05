"""
Recommendation router — POST /api/recommend, GET /api/history, DELETE /api/history/{id}
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from app.schemas.recommendation import CareerFormRequest
from app.services.ai_service import generate_career_recommendations
from app.models.recommendation import RecommendationModel
from app.middleware.auth_middleware import get_current_user_id, get_db
from app.utils.response import success_response, error_response
from app.utils.exceptions import (
    AIServiceException,
    DatabaseException,
    NotFoundException,
)
import logging

router = APIRouter(prefix="/api", tags=["Recommendations"])
logger = logging.getLogger(__name__)

RECS_COLLECTION = "recommendations"


@router.post("/recommend")
async def create_recommendation(
    body: CareerFormRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        payload = body.model_dump()
        ai_result = await generate_career_recommendations(payload)

        rec = RecommendationModel(
            user_id=user_id,
            recommendation=ai_result,
            **payload,
        )
        result = await db[RECS_COLLECTION].insert_one(rec.to_mongo())
        rec.id = str(result.inserted_id)

        return JSONResponse(
            status_code=201,
            content=success_response(
                "Career recommendations generated successfully.",
                {
                    "id": rec.id,
                    "recommendation": ai_result,
                    "created_at": rec.created_at.isoformat(),
                },
            ),
        )
    except AIServiceException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except DatabaseException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except Exception as e:
        logger.error(f"Unexpected error in recommend: {e}")
        return JSONResponse(status_code=500, content=error_response(f"Internal server error: {e}"))


@router.get("/history")
async def get_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: str = Query(None),
):
    try:
        skip = (page - 1) * limit
        query: dict = {"user_id": user_id}

        if search:
            query["$or"] = [
                {"career_goal": {"$regex": search, "$options": "i"}},
                {"preferred_industry": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
            ]

        total = await db[RECS_COLLECTION].count_documents(query)
        cursor = (
            db[RECS_COLLECTION]
            .find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        records = [RecommendationModel.from_mongo(d).model_dump() for d in docs]

        # Serialize datetime objects for JSON
        for r in records:
            if r.get("created_at"):
                r["created_at"] = r["created_at"].isoformat()

        return JSONResponse(
            status_code=200,
            content=success_response(
                "History fetched successfully.",
                {
                    "records": records,
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit,
                },
            ),
        )
    except DatabaseException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except Exception as e:
        logger.error(f"History fetch error: {e}")
        return JSONResponse(status_code=500, content=error_response(str(e)))


@router.delete("/history/{rec_id}")
async def delete_recommendation(
    rec_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    try:
        oid = ObjectId(rec_id)
    except InvalidId:
        return JSONResponse(status_code=400, content=error_response("Invalid recommendation ID."))

    try:
        doc = await db[RECS_COLLECTION].find_one({"_id": oid, "user_id": user_id})
        if not doc:
            raise NotFoundException("Recommendation not found or access denied.")

        await db[RECS_COLLECTION].delete_one({"_id": oid})
        return JSONResponse(
            status_code=200,
            content=success_response("Recommendation deleted successfully."),
        )
    except NotFoundException as e:
        return JSONResponse(status_code=e.status_code, content=error_response(e.message))
    except Exception as e:
        logger.error(f"Delete error: {e}")
        return JSONResponse(status_code=500, content=error_response(str(e)))
