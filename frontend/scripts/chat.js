const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("token")

if (!token) {
    alert("Not authorized. Please login");
    window.location.href = "login.html";
}

const chatTitleHeader = document.querySelector('.chat-title h2');
const chatTitleAvatar = document.querySelector('.chat-title .avatar');

let currentUserId = null;

async function getUserId() {
    if (currentUserId !== null) {
        return currentUserId;
    }
    const res = await fetch(`${API_URL}/user/users/me`, {
        headers: {"Authorization": `Bearer ${token}`}
    });

    if (!res.ok) {
        alert("You are not logged in.");
        window.location.href = "login.html";
        return null;
    }
    else {
        const user = await res.json();
        currentUserId = user.id;
        return currentUserId;
    }
}

async function loadMessages(chatId, chatName, profileUrl = "assets/default-profile-icon.jpg") {
    chatTitleHeader.textContent = chatName;
    chatTitleAvatar.src = profileUrl;

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: {"Authorization": `Bearer ${token}`}
    });
    
    if (!res.ok) {
        console.error("Failed to load messages:", res.status, res.statusText);
        return;
    }

    const messages = await res.json();
    const messageDiv = document.getElementById("messages");
    messageDiv.innerHTML = "";

    const userId = await getUserId();

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message");
        div.classList.add(msg.sender_id === userId ? "sent" : "received");

        const textSpan = document.createElement("span");
        textSpan.classList.add("text");
        textSpan.textContent = msg.content;
        
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("time");
        const date = new Date(msg.created_at);
        timeSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        div.appendChild(textSpan);
        div.appendChild(timeSpan);

        messageDiv.appendChild(div);
    });
}

async function loadContacts() {
    const res = await fetch(`${API_URL}/chats/contacts`, {
        headers: {"Authorization": `Bearer ${token}`}
    });
    
    if (!res.ok) {
        console.error("Failed to load contacts:", res.status, res.statusText);
        chatTitleHeader.textContent = "Error loading chats";
        return;
    }

    const chats = await res.json();
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";
    
    let firstChatLoaded = false;

    chats.forEach(chat => {
        let displayName = chat.name || "Group Chat";
        let profileUrl = "assets/default-profile-icon.jpg";

        if (chat.type === "personal" && chat.contact) {
            displayName = chat.contact.username;
            if (chat.contact.profile_pic) {
                profileUrl = chat.contact.profile_pic;
            }
        }
        
        if (!firstChatLoaded) {
            loadMessages(chat.id, displayName, profileUrl);
            firstChatLoaded = true;
        }

        const chatItem = document.createElement("li");
        chatItem.classList.add("chat-item");
        
        const avatar = document.createElement("img");
        avatar.classList.add("avatar");
        avatar.src = profileUrl;
        chatItem.appendChild(avatar);

        const chatInfo = document.createElement("div");
        chatInfo.classList.add("chat-info");

        const chatName = document.createElement("span");
        chatName.classList.add("chat-name");
        chatName.textContent = displayName;
        
        const recentMsg = document.createElement("span");
        recentMsg.classList.add("recent-msg");
        recentMsg.textContent = "Click to chat";

        chatInfo.appendChild(chatName);
        chatInfo.appendChild(recentMsg);

        chatItem.appendChild(chatInfo);

        chatItem.onclick = () => loadMessages(chat.id, displayName, profileUrl);

        chatList.appendChild(chatItem);
    });
}
document.addEventListener("DOMContentLoaded", loadContacts);