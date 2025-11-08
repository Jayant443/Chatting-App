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

const optionsMenu = document.querySelector(".options-menu");
const optionsBtn = document.querySelector(".options-button");
const logoutBtn = document.getElementById("logout-btn");

const createGroupForm = document.querySelector(".create-group-form");
const createGroupBtn = document.getElementById("create-group");
const createGroupInput = document.getElementById("group-name-input");
const createGroupSubmitBtn = document.getElementById("create-group-btn");
const membersContainer = document.querySelector(".create-group-form .add-member");
const viewProfileBtn = document.getElementById("view-profile");
const profilePanel = document.querySelector(".profile");

let currentUserId = null;
let currentChatId = null;
let chatWebsocket = null;

let allContactsData = [];
let selectedMembers = new Set();

function toggleCreateGrp() {
    const isHidden = createGroupForm.style.display === "none" || !createGroupForm.style.display;
    createGroupForm.style.display = isHidden ? "flex" : "none";

    if (isHidden) {
        renderSelectableMembers();
    } else {
        selectedMembers.clear();
        membersContainer.innerHTML = "<h4>Add Members</h4>";
        createGroupInput.value = "";
    }
}

async function toggleProfile() {
    const isHidden = profilePanel.style.display === "none" || !profilePanel.style.display;
    profilePanel.style.display = isHidden ? "flex" : "none";
    if (isHidden) {
        await populateProfile();
    }
}

function handleDocumentClick(event) {
    const isClickInsideOptions = optionsMenu.contains(event.target) || optionsBtn.contains(event.target);
    const isClickInsideAddContactForm = addContactForm.contains(event.target) || addContactBtn.contains(event.target);
     const isClickInsideCreateGroupForm = createGroupForm.contains(event.target) || createGroupBtn.contains(event.target);
     const isClickInsideProfile = profilePanel.contains(event.target) || viewProfileBtn.contains(event.target);
    
    if (!isClickInsideOptions && optionsMenu.style.display !== "none") {
        optionsMenu.style.display = "none";
    }

    if (!isClickInsideAddContactForm && addContactForm.style.display === "flex") {
        addContactForm.style.display = "none";
    }

    if (!isClickInsideCreateGroupForm && createGroupForm.style.display === "flex") {
        createGroupForm.style.display = "none";
    }
    
    if (!isClickInsideProfile && profilePanel.style.display === "flex") {
        profilePanel.style.display = "none";
    }
}

async function toggleOptions() {
    optionsMenu.style.display = optionsMenu.style.display ==="none" ? "grid" : "none";
}

function toggleMemberSelection(itemElement, userId) {
    if (selectedMembers.has(userId)) {
        selectedMembers.delete(userId);
        itemElement.style.backgroundColor = "#383838";
    } else {
        selectedMembers.add(userId);
        itemElement.style.backgroundColor = "#1a7ca3";
    }
}

function renderSelectableMembers() {
    membersContainer.innerHTML = "<h4>Add Members</h4>";
    const selectableUsers = allContactsData.filter(chat => chat.type === 'personal');

    if (selectableUsers.length === 0) {
        membersContainer.innerHTML += `<p style='padding: 10px; color:#aaa;'>No other contacts found.</p>`;
        return;
    }

    selectableUsers.forEach(chat => {
        const userId = chat.contact.id;
        const username = chat.contact.username;
        const profilePic = chat.contact.profile_pic || "assets/default-profile-icon.jpg";

        const item = document.createElement("button");
        item.classList.add("menu-option");
        item.setAttribute("data-user-id", userId);
        
        const img = document.createElement("img");
        img.src = profilePic;
        img.classList.add("avatar"); 
        
        const nameP = document.createElement("p");
        nameP.textContent = username;
        
        item.prepend(img);
        item.appendChild(nameP);
        item.addEventListener("click", () => toggleMemberSelection(item, userId));
        
        membersContainer.appendChild(item);
    });
}

async function createGroup() {
    const groupName = createGroupInput.value.trim();
    const adminId = currentUserId;

    if (selectedMembers.size === 0) {
        alert("Please select a member to create group.");
        return;
    }

    const body = JSON.stringify({
        name: groupName,
        type: "group",
        admin_id: adminId
    });
    const res = await fetch(`${API_URL}/chats/group/create`, {
        method: "POST",
        headers: {
            "Authorization":`Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: body
    });

    if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to create group: ${errorData.detail || 'Unknown error'}`);
        return;
    }

    const newGroup = await res.json();
    for (const memberId of selectedMembers) {
        let newGroupBody = JSON.stringify({
            user_id: memberId
        });
        await fetch(`${API_URL}/chats/${newGroup.id}/members`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: newGroupBody
        });
    }
    toggleCreateGrp();
    await loadContacts();
    alert(`Group "${groupName}" created successfully!`);
}

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
        const newChat = await res.json();
        addContactInput.value = '';
        toggleAddContact(); 
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

    if (msg.sender_id!=currentUserId) {
        div.classList.add("received");
        const sender = document.createElement("span");
        sender.classList.add("sender");
        sender.textContent = msg.sender.username;
        console.log(msg.sender);
        div.appendChild(sender);
    }
    
    else {
        div.classList.add("sent");
    }
    
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("details");

    const textSpan = document.createElement("span");
    textSpan.classList.add("text");
    textSpan.textContent = msg.content;

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("time");
    const date = new Date(msg.created_at);
    timeSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    detailsDiv.appendChild(textSpan);
    detailsDiv.appendChild(timeSpan);        
    div.appendChild(detailsDiv);
    messageDiv.appendChild(div);
    messageDiv.scrollTop = messageDiv.scrollHeight;
    
}

async function loadMessages(chatId, chatName, profileUrl = "assets/default-profile-icon.jpg") {
    currentChatId = chatId;
    chatTitleHeader.textContent = chatName;
    chatTitleAvatar.src = profileUrl;

    const userId = await getUserId();

    await connectWebsocket(chatId);

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        console.error("Failed to load messages:", res.status, res.statusText);
        return;
    }

    const messages = await res.json();
    const messageDiv = document.getElementById("messages");
    messageDiv.innerHTML = "";
    messages.forEach(msg => addMessage(msg));
}

async function connectWebsocket(chatId) {
    if (chatWebsocket) {
        chatWebsocket.close();
    }

    const wsUrl = `ws://127.0.0.1:8000/chats/ws/${chatId}?token=${token}`;
    chatWebsocket = new WebSocket(wsUrl);

    chatWebsocket.onopen = () => {
        console.log(`Connected to chat ${chatId}`);
    };

    chatWebsocket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            addMessage(msg);
        } catch (err) {
            console.error("Invalid message data:", event.data, err);
        }
    };

    chatWebsocket.onclose = (event) => {
        console.warn(`WebSocket closed (${event.code}): ${event.reason || "no reason"}`);
    };

    chatWebsocket.onerror = (error) => {
        console.error("WebSocket error:", error);
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
    allContactsData = chats; 
    
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

async function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

async function populateProfile() {
    const res = await fetch(`${API_URL}/user/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    const user = await res.json();

    if (!currentUserId) currentUserId = user.id;

    const usernameEl = document.getElementById("profile-username");
    const emailEl = document.getElementById("profile-email");
    const joinDateEl = document.getElementById("profile-join-date");

    if (usernameEl) usernameEl.textContent = user.username || "";
    if (emailEl) emailEl.textContent = user.email || "";

    if (joinDateEl) {
        try {
            const created = new Date(user.created_at);
            joinDateEl.textContent = created.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
        } catch {
            joinDateEl.textContent = "";
        }
    }
}



document.addEventListener("DOMContentLoaded", async () => {
    const userId = await getUserId();
    
    if (userId) {
        loadContacts();
    }

    document.querySelector(".chat-input .send-btn").addEventListener("click", sendMessage);
    optionsBtn.addEventListener("click", toggleOptions);
    addContactBtn.addEventListener("click", toggleAddContact);
    createGroupBtn.addEventListener("click", toggleCreateGrp);
    createGroupSubmitBtn.addEventListener("click", createGroup);
    viewProfileBtn.addEventListener("click", toggleProfile); 
    addContactSubmitBtn.addEventListener("click", addContact);
    logoutBtn.addEventListener("click", logout);
    document.addEventListener("click", handleDocumentClick);
    addContactInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            addContact();
        }
    });
    document.querySelector('.chat-input input[type="text"]').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});