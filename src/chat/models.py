from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, text, DateTime
from typing import Optional, List
from datetime import datetime
from src.users.models import User

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    chat_id: int = Field(foreign_key="chats.id")
    sender_id: int = Field(foreign_key="users.id")
    content: str
    created_at: datetime = Field(sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP")))
    
    sender: "User" = Relationship(back_populates="messages")
    chat: "Chat" = Relationship(back_populates="messages")

class Chat(SQLModel, table=True):
    __tablename__ = "chats"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(sa_column=Column(DateTime, server_default=text("CURRENT_TIMESTAMP")))
    name: Optional[str] = None
    admin_id: Optional[int] = None
    type: str = Field(default="personal")

    members: List["ChatMember"] = Relationship(back_populates="chat")
    messages: List["Message"] = Relationship(back_populates="chat")

class ChatMember(SQLModel, table=True):
    __tablename__ = "chatmembers"

    id: Optional[int] = Field(default=None, primary_key=True)
    chat_id: int = Field(foreign_key="chats.id")
    user_id: int = Field(foreign_key="users.id")
    role: str = Field(default="member")

    user: "User" = Relationship(back_populates="chat_memberships")
    chat: "Chat" = Relationship(back_populates="members")   

