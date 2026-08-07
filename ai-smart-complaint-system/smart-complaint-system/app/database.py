import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_core import core_schema
from bson import ObjectId
from dotenv import load_dotenv

# 1. Load configuration variables from your .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smart_complaint_db")

# 2. Establish the async connection pool to your running MongoDB service
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# 3. Custom validator class to gracefully map MongoDB ObjectIds to JSON strings
class PyObjectId:
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(ObjectId),
            # Uses the correct serialization name to prevent the core attribute crash
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )