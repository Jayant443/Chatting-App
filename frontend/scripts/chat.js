const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("token")

if (!token) {
    alert("Not authorized. Please login");
    window.location.href = "login.html";
}

const chatTitleHeader = document.querySelector(".chat-title h2");
const chatTitleAvatar = document.querySelector(".chat-title .avatar");
const messageInput = document.getElementById("message-input");

const addContactBtn = document.getElementById("add-contact");
const addContactForm = document.querySelector(".add-contact-form");
const addContactInput = document.getElementById("add-contact-input");
const addContactSubmitBtn = document.getElementById("add-contact-submit-btn");

let currentUserId = null;
let currentChatId = null;
let chatWebsocket = null;

function toggleAddContact() {
    addContactForm.style.display = addContactForm.style.display==="none" ? "flex" : "none";
}

async function addContact() {
    const email = addContactInput.value.trim();
    if (!email) {
        alert("Please enter an email.");
        return;
    }

    const body = JSON.stringify({email: email});

    const res = await fetch(`${API_URL}/chats/contact/add`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`
        },
        body: body
    });
    if (res.ok) {
        const newchat = await res.json();
        addContactInput.value = '';
        toggleAddContactForm(); 
        await loadContacts();
        const displayName = newChat.contact.username;
        const profileUrl = newChat.contact.profile_pic || "assets/default-profile-icon.jpg";

        loadMessages(newChat.id, displayName, profileUrl);
    } else {
        const errorData = await res.json();
        alert(`Failed to add contact: ${errorData.detail || 'Unknown error'}`);
    }
}


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

async function addMessage(msg) {
    const messageDiv = document.getElementById("messages");
    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.system) {
       div.classList.add("system");
       div.textContent = msg.message;
    } 
    else {
        div.classList.add(msg.sender_id===currentUserId ? "sent" : "received");
        
        const textSpan = document.createElement("span");
        textSpan.classList.add("text");
        textSpan.textContent = msg.content;
    
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("time");
        const date = new Date(msg.created_at);
        timeSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
        div.appendChild(textSpan);
        div.appendChild(timeSpan);
     }


    messageDiv.appendChild(div);
    messageDiv.scrollTop = messageDiv.scrollHeight;
    
}

async function loadMessages(chatId, chatName, profileUrl = "assets/default-profile-icon.jpg") {
    currentChatId = chatId;
    chatTitleHeader.textContent = chatName;
    chatTitleAvatar.src = profileUrl;

    const userId = await getUserId();

    connectWebsocket(chatId);

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

    messages.forEach(msg => {
        addMessage(msg);
    });
}

async function connectWebsocket(chatId) {
    if (chatWebsocket) {
        chatWebsocket.close();
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/${chatId}?token=${token}`;
    chatWebsocket = new WebSocket(wsUrl);

    chatWebsocket.onopen = () => {
        console.log(`connected to chat: ${chatId}`);
    };

    chatWebsocket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        addMessage(msg);
    };

    chatWebsocket.onclose = (event) => {
        console.log("Websocket closed: ", event.code, event.reason);
    }

    chatWebsocket.onerror = (error) => {
        console.error("Websocket error: ", error);
    };
}

async function sendMessage() {
    if (!chatWebsocket || chatWebsocket.readyState!==WebSocket.OPEN) {
        console.error("Websocket is not connected");
        return;
    }

    const content = messageInput.value.trim();
    if (content.length===0) {
        return;
    }

    chatWebsocket.send(content);
    messageInput.value = "";
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



document.addEventListener("DOMContentLoaded", () => {
    getUserId();
    loadContacts();

    document.querySelector(".chat-input .send-btn").addEventListener("click", sendMessage);
    addContactBtn.addEventListener("click", toggleAddContact);
    addContactSubmitBtn.addEventListener("click", addContact);

    addContactInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addContact();
        }
    });

    document.querySelector('.chat-input input[type="text"]').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}); 