"""
Database connection module — singleton Motor/MongoDB client.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.utils.exceptions import DatabaseException

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo(uri: str, db_name: str) -> None:
    """
    Initialize MongoDB connection and verify connectivity.
    """
    global _client, _database

    try:
        _client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=15000,
            socketTimeoutMS=15000,
            maxPoolSize=50,
            minPoolSize=5,
            retryWrites=True,
        )

        # Verify connection
        await _client.admin.command("ping")

        _database = _client[db_name]

        logger.info("✅ Successfully connected to MongoDB Atlas.")

    except PyMongoError as e:
        logger.exception("❌ MongoDB connection failed")
        raise DatabaseException(f"Could not connect to MongoDB: {str(e)}")


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection.
    """
    global _client

    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """
    Return MongoDB database instance.
    """
    if _database is None:
        raise DatabaseException(
            "Database is not connected. Please check MongoDB connection."
        )

    return _database