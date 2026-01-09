from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from src.core.database import get_session
from sqlalchemy.ext.asyncio.session import AsyncSession
from .crud import CrudChat
from src.users.crud import CrudUser
from src.users.models import User
from src.auth.dependencies import get_current_user
from .schema import (
                CreateMessage,
                CreateChatMember,
                CreateChat,
                UpdateChat,
                MessageSchema,
                ChatSchema,
                ChatMemberSchema,
                ChatBase,
                MessageBase, 
                ChatMemberBase,
                ContactDetail,
                ChatSchemaWithContact,
                AddContactrequest,
                MessageWithSender, 
                SenderDetail
            )

chat_router = APIRouter()
chat_crud = CrudChat()
user_crud = CrudUser()

@chat_router.get("/{chat_id}/messages", response_model=List[MessageWithSender])
async def get_chat_messages(chat_id: int, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    chat = await chat_crud.get_chat_by_id(chat_id, session)
    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    user_in_chat = await chat_crud.get_group_member_by_id(chat_id, current_user.id, session)
    if user_in_chat is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this chat. Cannot view messages."
        )

    messages = await chat_crud.get_chat_messages_by_id(chat_id, session)

    response_messages = []
    for message in messages:
        sender = await user_crud.get_user_by_id(message.sender_id, session)
        message_data = MessageWithSender.model_validate(message)
        if sender:
            message_data.sender = SenderDetail.model_validate(sender)
        response_messages.append(message_data)
    
    return response_messages

@chat_router.post("/group/create")
async def create_group_chat(chat: CreateChat, session: AsyncSession = Depends(get_session)):
    chat = await chat_crud.create_group_chat(chat, session)
    return chat

@chat_router.put("/{chat_id}/update")
async def update_chat(chat_id: int, chat: UpdateChat, session: AsyncSession = Depends(get_session)):
    chat_to_update = await chat_crud.get_chat_by_id(chat_id, session)
    if chat_to_update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This chat does not exists")
    updated_chat = await chat_crud.update_chat(chat_id, chat, session)
    return updated_chat

@chat_router.post("/{chat_id}/members")
async def add_members(chat_id: int, chat_member: CreateChatMember, session: AsyncSession = Depends(get_session)):
    member = await chat_crud.add_member_to_chat(chat_id, chat_member, session)
    if member is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something went wrong")
    return member

@chat_router.post("/contact/add", response_model=ChatSchemaWithContact, status_code=status.HTTP_201_CREATED)
async def add_contact_by_email(request_data: AddContactrequest, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    target_user = await user_crud.get_user_by_email(request_data.email, session)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found.")
    user1_id = current_user.id
    user2_id = target_user.id
    new_chat = await chat_crud.create_personal_chat(user1_id, user2_id, session)
    chat_data = ChatSchemaWithContact.model_validate(new_chat)
    chat_data.contact = ContactDetail.model_validate(target_user)
    return chat_data

@chat_router.delete("/{chat_id}/members/{user_id}")
async def remove_member(chat_id: int, user_id: int, admin_id: int, session: AsyncSession = Depends(get_session)):
    chat_deleted = await chat_crud.remove_member_from_chat(chat_id, user_id, admin_id, session)
    if not chat_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return f"Removed: {user_id}"

@chat_router.post("/{chat_id}/leave")
async def leave_chat(chat_member: ChatMemberBase, session: AsyncSession = Depends(get_session)):
    left = await chat_crud.leave_chat(chat_member, session)
    if not left:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something went wrong")
    return left

@chat_router.get("/contacts", response_model=List[ChatSchemaWithContact])
async def get_my_chats(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    chats = await chat_crud.get_all_user_chats(current_user.id, session)
    response_list: List[ChatSchemaWithContact] = []
    for chat in chats:
        chat_data = ChatSchemaWithContact.model_validate(chat)
        if chat.type == "personal":
            chat_members = await chat_crud.get_chat_members(chat.id, session)
            other_member = next((m for m in chat_members if m.user_id != current_user.id), None)
            if other_member:
                other_user = await user_crud.get_user_by_id(other_member.user_id, session)
                if other_user:
                    chat_data.contact = ContactDetail.model_validate(other_user)
        response_list.append(chat_data)
    return response_list

