from sqlmodel import select
from typing import Optional, List
from .models import Message, ChatMember, Chat
from sqlmodel.ext.asyncio.session import AsyncSession
from .schema import (
                CreateMessage,
                MessageSchema,
                CreateChat,
                UpdateChat,
                CreateChatMember,
                ChatMemberSchema,
                ChatMemberBase
            )

class CrudChat:
    async def create_message(self, message: CreateMessage, session: AsyncSession) -> Optional[Message]:
        message_data_dict = message.model_dump()
        new_message = Message(**message_data_dict)
        session.add(new_message)
        await session.commit()
        await session.refresh(new_message)
        return new_message
    
    async def create_group_chat(self, chat_data: CreateChat, session: AsyncSession) -> Chat:
        new_chat = Chat(name=chat_data.name, type="group")
        session.add(new_chat)
        await session.commit()
        await session.refresh(new_chat)
        creator_member = ChatMember(chat_id=new_chat.id, user_id=chat_data.admin_id, role="admin")
        session.add(creator_member)
        await session.commit()
        return new_chat

    async def create_personal_chat(self, user1_id: int, user2_id: int, session: AsyncSession) -> Chat:
        new_chat = Chat(name=None, type="personal")
        session.add(new_chat)
        await session.commit()
        await session.refresh(new_chat)
        for uid in [user1_id, user2_id]:
            member = ChatMember(chat_id=new_chat.id, user_id=uid, role="member")
            session.add(member)
        await session.commit()
        return new_chat
    
    async def update_chat(self, chat_id: int, chat: UpdateChat, session: AsyncSession) -> Optional[Chat]:
        existing = await session.get(Chat, chat_id)
        if existing is None:
            return None
        chat_data_dict = chat.model_dump(exclude_unset=True)
        for key, value in chat_data_dict.items():
            setattr(existing, key, value)
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing

    async def add_member_to_chat(self, chat_id: int, chat_member: CreateChatMember, session: AsyncSession) -> Optional[ChatMember]:
        result = await session.exec(select(ChatMember).where(ChatMember.chat_id==chat_id, ChatMember.user_id==chat_member.user_id))
        existing = result.first()
        if existing is not None:
            return existing
        new_member = ChatMember(
            chat_id=chat_id, 
            user_id=chat_member.user_id
        )
        session.add(new_member)
        await session.commit()
        await session.refresh(new_member)
        return new_member
    
    async def get_chat_by_id(self, chat_id: int, session: AsyncSession):
        result = await session.exec(select(Chat).where(Chat.id==chat_id))
        chat = result.first()
        if chat is None:
            return None
        return chat
    
    async def get_chat_by_name(self, chat_name: str, session: AsyncSession):
        result = await session.exec(select(Chat).where(Chat.name==chat_name))
        chat = result.first()
        if chat is None:
            return None
        return chat
    
    async def get_chat_messages_by_id(self, chat_id: int, session: AsyncSession) -> Optional[Message]:
        result = await session.exec(select(Message).where(Message.chat_id==chat_id))
        return result.all()
    
    async def get_group_member_by_id(self, chat_id: int, user_id: int, session: AsyncSession):
        result = await session.exec(select(ChatMember).where(ChatMember.chat_id==chat_id, ChatMember.user_id==user_id))
        return result.first()

    async def get_chat_members(self, chat_id: int, session: AsyncSession) -> List[ChatMember]:
        result = await session.exec(select(ChatMember).where(ChatMember.chat_id==chat_id))
        return result.all()
    
    async def remove_member_from_chat(self, chat_id: int, member_id: int, admin_id: int, session: AsyncSession):
        result = await session.exec(select(ChatMember).where(ChatMember.chat_id==chat_id, ChatMember.user_id==member_id))
        member_to_remove = result.first()
        if member_to_remove is None:
            return False
        result = await session.exec(select(Chat).where(Chat.id==chat_id))
        chat = result.first()
        if chat.admin_id!=admin_id:
            return False
        session.delete(member_to_remove)
        await session.commit()
        return True
    
    async def leave_chat(self, chat_member: ChatMemberBase, session: AsyncSession):
        result = await session.exec(select(ChatMember).where(ChatMember.chat_id==chat_member.chat_id, ChatMember.user_id==chat_member.user_id))
        member = result.first()
        if member is None:
            return False
        chat = await session.get(Chat, chat_member.chat_id)
        if chat.type=="personal":
            return False
        session.delete(member)
        await session.commit()
        return True
    
    async def delete_message(self, user_id: int, message_id:int, session: AsyncSession):
        message_to_delete = await session.get(Message, message_id)
        if message_to_delete is None:
            return False
        if message_to_delete.sender_id != user_id:
            return False
        session.delete(message_to_delete)
        await session.commit()
        return True 
    
    async def get_all_user_chats(self, user_id: int, session: AsyncSession) -> List[Chat]:
        result = await session.exec(select(Chat).join(ChatMember).where(ChatMember.user_id == user_id))
        return result.all()

