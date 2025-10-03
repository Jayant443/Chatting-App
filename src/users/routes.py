from fastapi import APIRouter, HTTPException, status, Depends
from src.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from .schema import CreateUser, UserSchema, UpdateUser
from .crud import CrudUser
from fastapi.security import OAuth2PasswordRequestForm
from src.auth.dependencies import Token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from src.auth.jwt import create_access_token
from src.auth.hashing import verify_password
from datetime import timedelta
from typing import Optional
from .models import User

user_router = APIRouter()
user_crud = CrudUser()


async def get_user(username: str, session: AsyncSession) -> Optional[User]:
    return await user_crud.get_user(username, session)


async def authenticate_user(username: str, password: str, session: AsyncSession) -> Optional[User]:
    user = await get_user(username, session)
    if user is None:
        return None
    if not verify_password(password, user.password):
        return None
    return user


@user_router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=UserSchema)
async def create_account(user: CreateUser, session: AsyncSession = Depends(get_session)) -> UserSchema:
    existing = await user_crud.get_user(user.username, session)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is not available",
        )
    new_user = await user_crud.create_user(user, session)
    return new_user


@user_router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    user = await authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@user_router.get("/users/me", response_model=UserSchema)
async def read_users_me(current_user: UserSchema = Depends(get_current_user), session: AsyncSession = Depends(get_session),):
    user = await get_user(current_user.username, session)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
