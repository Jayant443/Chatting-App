from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src.core.database import get_session
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from src.users.crud import CrudUser
from src.core.config import Config

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/token")
user_crud = CrudUser()
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None
    user_id: int = None

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await user_crud.get_user(username=username, session=session)
    if user is None:
        raise credentials_exception
    return user
