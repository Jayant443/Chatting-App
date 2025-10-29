from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
from sqlmodel.ext.asyncio.session import AsyncSession
import json
from jose import JWTError, jwt
from src.core.config import Config
from src.core.database import get_session
from src.users.models import User
from src.users.crud import CrudUser
from .crud import CrudChat
from .schema import CreateMessage

message_router = APIRouter()
chat_crud = CrudChat()
user_crud = CrudUser()


class ConnectionManager:
    def __init__(self):
        self.chats: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: int):
        await websocket.accept()
        conns = self.chats.setdefault(chat_id, [])
        conns.append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        conns = self.chats.get(chat_id)
        if not conns:
            return
        try:
            conns.remove(websocket)
        except ValueError:
            pass
        if not conns:
            self.chats.pop(chat_id, None)

    async def broadcast(self, chat_id: int, message: dict):
        conns = list(self.chats.get(chat_id, []))
        updated_conns = []
        data = json.dumps(message)

        for conn in conns:
            try:
                await conn.send_text(data)
                updated_conns.append(conn)
            except Exception:
                pass

        if updated_conns:
            self.chats[chat_id] = updated_conns
        else:
            self.chats.pop(chat_id, None)


manager = ConnectionManager()


@message_router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, session: AsyncSession = Depends(get_session)):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Missing token")
        return

    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            await websocket.close(code=1008, reason="Invalid token payload")
            return
    except JWTError:
        await websocket.close(code=1008, reason="Invalid token")
        return

    user = await user_crud.get_user(username=username, session=session)
    if user is None:
        await websocket.close(code=1008, reason="User not found")
        return

    chat = await chat_crud.get_chat_by_id(chat_id, session)
    if chat is None:
        await websocket.close(code=1008, reason="Chat does not exist")
        return

    user_in_chat = await chat_crud.get_group_member_by_id(chat.id, user.id, session)
    if user_in_chat is None:
        await websocket.close(code=1008, reason="Not a member of this chat")
        return

    await manager.connect(websocket, chat.id)

    try:
        while True:
            data = await websocket.receive_text()
            message_in = CreateMessage(chat_id=chat.id, sender_id=user.id, content=data)
            saved_message = await chat_crud.create_message(message_in, session)
            await manager.broadcast(chat.id, {
                "id": saved_message.id,
                "chat_id": saved_message.chat_id,
                "sender_id": saved_message.sender_id,
                "username": user.username,
                "content": saved_message.content,
                "created_at": saved_message.created_at.isoformat()
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket, chat.id)