import Sidebar from "../components/Sidebar"
import "./index.css";
import { getContacts, getMessages, getCurrentUser, createGrp, addMember, getWebSocketUrl } from "../services/chat";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import Options from "../components/Options";
import Profile from "../components/Profile";
import CreateGroupModal from "../components/CreateGroupModal";
import NewContact from "../components/NewContact";
import defaultAvatar from "../assets/default-profile-icon.jpg";

function Chat() {
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showNewContactForm, setShowNewContactForm] = useState(false);
    const webSocketRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            const data = await getMessages(currentChat.id);
            setMessages(data);
        }
        if (currentChat?.id) {
            loadMessages();
            connectWebsocket(currentChat.id);
        }

        return () => {
            if (webSocketRef.current) {
                try {
                    webSocketRef.current.close();
                }
                catch (err) {
                    console.log("Error closing websocket:", err);
                }
                webSocketRef.current = null;
            }
        }
    }, [currentChat]);

    useEffect(() => {
        const currentUserObj = async () => {
            const data = await getCurrentUser();
            setCurrentUser(data);
        }
        currentUserObj();
    }, []);

    function handleCurrentChat(chat) {
        setCurrentChat(chat);
    }

    const loadContacts = async () => {
        const data = await getContacts();
        setContacts(data);
        if (data.length > 0 && !currentChat) {
            setCurrentChat(data[0]);
        }
    }

    const getUserDisplayInfo = (chat) => {
        if (chat.type === "personal" && chat.contact) {
            return {
                name: chat.contact.username,
                avatar: defaultAvatar
            }
        }
        return {
            name: chat.name || "Group Chat",
            avatar: defaultAvatar
        }
    }

    async function createGroup(grpName, memberIds) {
        const group = await createGrp(grpName, currentUser.id);
        for (const id of memberIds) {
            await addMember(id, group.id);
        }
        await loadContacts();
    }

    function connectWebsocket(chatId) {
        if (webSocketRef.current) {
            try {
                webSocketRef.current.close();
            }
            catch (err) {
                console.log("Error closing previous websocket:", err);
            }
            webSocketRef.current = null;
        }

        const ws = new WebSocket(getWebSocketUrl(chatId));

        ws.onopen = () => {
            console.log(`Connected to chat: ${chatId}`);
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                setMessages((prev) => [...prev, msg]);
            }
            catch(err) {
                console.log("Invalid message data: ", err);
            }
        }

        ws.onclose = () => {
            console.log("websockets closed");
        }

        webSocketRef.current = ws;
    }

    function sendMsg(msg) {
        if (webSocketRef.current?.readyState===WebSocket.OPEN && msg.trim()) {
            webSocketRef.current.send(msg);
        }
    }

    function logout() {
        localStorage.removeItem("token");
        navigate("/login", {replace: true});
    }

    return (
        <>
            <div className="chat-app">
                <Sidebar contacts={contacts} onSelectChat={handleCurrentChat} />
                <div className="chat-container">
                    {currentChat && (
                        <div className="chat-title">
                            <img src={getUserDisplayInfo(currentChat).avatar} className="avatar" />
                            <h2>{currentChat?.contact?.username || currentChat?.name || "Chat"}</h2>
                            <button className="options-button" onClick={() => { setShowOptions(!showOptions) }}>⋮</button>
                            {showOptions &&
                                <Options
                                    onCreateGroup={() => { setShowCreateGroup(true); setShowProfile(false); setShowNewContactForm(false) }}
                                    onViewProfile={() => { setShowProfile(true); setShowCreateGroup(false); setShowNewContactForm(false) }}
                                    onNewContact={() => { setShowNewContactForm(true); setShowCreateGroup(false); setShowProfile(false)}}
                                    onLogout={logout}
                                />
                            }
                            {showProfile && <Profile user={currentUser} onClose={() => setShowProfile(false)} />}
                            { showNewContactForm && (<NewContact onClose={() => setShowNewContactForm(false)} />)}
                            {showCreateGroup && <CreateGroupModal contacts={contacts} onClose={() => setShowCreateGroup(false)} onCreateGrp={createGroup} />}
                        </div>
                    )}
                    <ChatWindow currentUserId={currentUser?.id} messages={messages} onSendMsg={sendMsg}/>
                </div>
            </div>
        </>
    )
}

export default Chat;