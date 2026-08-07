import os
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load secret keys and configs out of your .env file
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "7f9bc8e390c2a118df283f6c8d2d88f6a9e102fdb8c1b26ea8923d240c1aefb2")
ALGORITHM = "HS256"

# Setup the bcrypt hashing engine context for secure password storage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Converts a citizen or officer plaintext password into a secure hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies if an incoming plaintext login password matches the stored DB hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Generates an automatic JWT Access Token for secure API state tracking."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Fallback to an automatic 60-minute session expiry
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
        
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)