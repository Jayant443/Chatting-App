import Sidebar from "../components/Sidebar"
import "./index.css";
import { getContacts, getMessages, getCurrentUser } from "../services/chat";
import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import Options from "../components/Options";
import defaultAvatar from "../assets/default-profile-icon.jpg";

export default function Chat() {
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const loadContacts = async () => {
            const data = await getContacts();
            setContacts(data);
            if (data.length>0 && !currentChat) {
                setCurrentChat(data[0]);
            }
        }
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
        }
    }, [currentChat]);

    useEffect(() => {
        const currentUser = async() => {
            const data = await getCurrentUser();
            setCurrentUserId(data.id);
        }
        currentUser();
    })

    function handleCurrentChat(chat) {
        setCurrentChat(chat);
    }

    const getUserDisplayInfo = (chat) => {
        if (chat.type==="personal" && chat.contact) {
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

    return (
        <>
            <div className="chat-app">
                <Sidebar contacts={contacts} onSelectChat={handleCurrentChat} />
                <div className="chat-container">
                    {currentChat && (
                        <div className="chat-title">
                            <img src={getUserDisplayInfo(currentChat).avatar} className="avatar" />
                            <h2>{currentChat?.contact?.username || currentChat?.name || "Chat"}</h2>
                            <Options />
                        </div>
                    )}
                    <ChatWindow currentUserId={currentUserId} messages={messages}/>
                </div>
            </div>
        </>
    )
}