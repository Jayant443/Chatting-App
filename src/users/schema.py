from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    profile_url: Optional[str] = None

class CreateUser(UserBase):
    password: str

class UpdateUser(BaseModel):
    username: Optional[str] = None
    profile_url: Optional[str] = None

class UserSchema(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
