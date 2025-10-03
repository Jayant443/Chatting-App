from datetime import datetime, timedelta, timezone
from src.core.config import Config
from jose import JWTError, jwt
import logging

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token):
    try:
        token_data = jwt.decode(
            jwt=token,
            key=Config.JWT_SECRET,
            algorithm=Config.JWT_ALGORITHM
        )
        
        return token_data
    except JWTError as e:
        logging.exception(e)
        return None
