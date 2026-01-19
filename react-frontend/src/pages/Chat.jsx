import Sidebar from "../components/Sidebar"
import "./index.css";
import { getContacts, getMessages, getCurrentUser } from "../services/chat";
import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import Options from "../components/Options";

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
    }, [currentChat]);

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

    return (
        <>
            <div className="chat-app">
                <Sidebar contacts={contacts} onSelectChat={handleCurrentChat} />
                <div className="chat-container">
                    <div className="chat-title">
                        <img src="assets/default-profile-icon.jpg" className="avatar" />
                        <h2>{currentChat?.contact.username}</h2>
                        <Options />
                    </div>
                    <ChatWindow currentUserId={currentUserId} messages={messages}/>
                </div>
            </div>
        </>
    )
}