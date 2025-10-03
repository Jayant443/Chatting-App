from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: EmailStr
    profile_url: Optional[str] = None

class CreateUser(UserBase):
    password: str

class UpdateUser(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    profile_url: Optional[str] = None

class UserSchema(UserBase):
    id: int
    password: str
    model_config = ConfigDict(from_attributes=True)
