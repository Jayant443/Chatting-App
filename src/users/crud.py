from sqlmodel import select
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from .models import User
from .schema import CreateUser, UpdateUser
from src.auth.hashing import hash_password


class CrudUser:
    async def create_user(self, user: CreateUser, session: AsyncSession) -> Optional[User]:
        result = await session.exec(select(User).where(User.username == user.username))
        existing = result.first()
        if existing is not None:
            return None

        user_data_dict = user.model_dump()
        user_data_dict["password"] = hash_password(user_data_dict["password"])
        new_user = User(**user_data_dict)

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user

    async def get_user(self, username: str, session: AsyncSession) -> Optional[User]:
        result = await session.exec(select(User).where(User.username == username))
        return result.first()

    async def update_user(self, session: AsyncSession, user: UpdateUser) -> Optional[User]:
        result = await session.exec(select(User).where(User.username == user.username))
        existing = result.first()
        if existing is None:
            return None

        user_data_dict = user.model_dump(exclude_unset=True)
        for key, value in user_data_dict.items():
            setattr(existing, key, value)

        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing

    async def delete_user(self, session: AsyncSession, user_id: int) -> bool:
        result = await session.exec(select(User).where(User.id == user_id))
        user = result.first()
        if user is None:
            return False

        await session.delete(user)
        await session.commit()
        return True
    
    async def get_user_by_id(self, user_id: int, session: AsyncSession) -> Optional[User]:
        result = await session.exec(select(User).where(User.id==user_id))
        user = result.first()
        return user
    