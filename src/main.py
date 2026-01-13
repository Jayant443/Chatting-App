from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
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

templates = Jinja2Templates(directory="frontend/templates")
app.mount("/frontend/static", StaticFiles(directory="frontend/static"), name="static")
app.mount("/frontend/scripts", StaticFiles(directory="frontend/scripts"), name="scripts")
app.mount("/assets", StaticFiles(directory="frontend/templates/assets"), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix=f"/user", tags = ["users"])
app.include_router(chat_router, prefix=f"/chats", tags = ["chats"])
app.include_router(message_router, prefix="/chats")



@app.get("/")
async def redirect_to_login():
    return RedirectResponse(url="/login.html")

@app.get("/login.html", response_class=HTMLResponse)
async def serve_login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/index.html", response_class=HTMLResponse)
async def serve_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/signup.html", response_class=HTMLResponse)
async def serve_signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})