from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.database import init_db
from .chat.websocket import message_router
from .chat.routes import chat_router
from .users.routes import user_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="chat app", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix=f"/user", tags = ["users"])
app.include_router(chat_router, prefix=f"/chats", tags = ["chats"])


# templates = Jinja2Templates(directory="frontend/templates")
# app.mount("/scripts", StaticFiles(directory="frontend/scripts"), name="scripts")
# app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# app.include_router(message_router)

@app.get("/")
async def read_root(request: Request):
    return {}
