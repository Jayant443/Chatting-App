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

class SenderDetail(BaseModel):
    id: int
    username: str
    profile_pic: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class MessageWithSender(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: str
    created_at: datetime
    sender: Optional[SenderDetail] = None
    model_config = ConfigDict(from_attributes=True)

#Chat schema
class ChatBase(BaseModel):
    name: str
    type: str
class CreateChat(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    admin_id: Optional[int] = None

class UpdateChat(BaseModel):
    name: Optional[str] = None

class ContactDetail(BaseModel):
    id: Optional[int] = None
    username: Optional[str] = None
    profile_pic: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AddContactrequest(BaseModel):
    email: str

class ChatSchemaWithContact(BaseModel):
    id: int
    name: Optional[str] = None
    type: str
    contact: Optional[ContactDetail] = None 
    model_config = ConfigDict(from_attributes=True)

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
    user_id: int

class ChatMemberSchema(ChatMemberBase):
    id: Optional[int]
    model_config = ConfigDict(from_attributes=True)
