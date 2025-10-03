from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

# Message Schema
class MessageBase(BaseModel):
    chat_id: int
    sender_id: int

class CreateMessage(MessageBase):
    content: str

class MessageSchema(MessageBase):
    id: Optional[int]
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


#Chat schema
class ChatBase(BaseModel):
    name: str
    type: str
class CreateChat(ChatBase):
    name: Optional[str] = None
    admin_id: int
    pass

class UpdateChat(BaseModel):
    name: Optional[str] = None

class ChatSchema(ChatBase):
    id: Optional[int]
    name: Optional[str]
    model_config = ConfigDict(from_attributes=True)


# Chat member schema
class ChatMemberBase(BaseModel):
    chat_id: int
    user_id: int
    role: str = "member"

class CreateChatMember(BaseModel):
    chat_id: int
    user_id: int

class ChatMemberSchema(ChatMemberBase):
    id: Optional[int]
    model_config = ConfigDict(from_attributes=True)
