const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

async function loadChats() {
    const res = await fetch(`${API_URL}/chats`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const chats = await res.json();
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";

    chats.forEach(chat => {
        const li = document.createElement("li");
        li.classList.add("chat-item");
        li.textContent = chat.name || "Personal Chat";
        li.onclick = () => loadMessages(chat.id, chat.name);
        chatList.appendChild(li);
    });
}

async function loadMessages(chatId, chatName) {
    document.getElementById("chat-title").textContent = chatName;

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const messages = await res.json();
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add(msg.sender_id === getUserId() ? "sent" : "received");
        div.textContent = msg.content;
        messagesDiv.appendChild(div);
    });
}

document.getElementById("chat-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("message-input");
    const content = input.value;
    const chatId = document.getElementById("chat-title").dataset.chatId;

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });

    if (res.ok) {
        input.value = "";
        loadMessages(chatId, document.getElementById("chat-title").textContent);
    }
});

document.addEventListener("DOMContentLoaded", loadChats);
