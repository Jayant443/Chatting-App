from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from src.chat.models import Message, ChatMember

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    password: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    profile_pic: Optional[str] = None

    messages: List["Message"] = Relationship(back_populates="sender")
    chat_memberships: List["ChatMember"] = Relationship(back_populates="user")
