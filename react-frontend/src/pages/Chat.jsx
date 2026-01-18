import Sidebar from "../components/Sidebar"
import "./index.css";
import { getContacts, getMessages } from "../services/chat";
import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import Options from "../components/Options";

export default function Chat() {
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        loadContacts;
    });

    useEffect(() => {
        if (currentChat) {
            loadMessages;
        }
    })
    const loadContacts = async () => {
        const data = await getContacts();
        setContacts(data);
    }

    function handleCurrentChat(chat) {
        setCurrentChat(chat);
    }

    const loadMessages = async () => {
        const data = await getMessages(currentChat.id);
        setMessages(data);
    }

    return (
        <>
            <div className="chat-app">
                <Sidebar contacts={contacts} onSelectChat={handleCurrentChat} />
                <div className="chat-container">
                    <div className="chat-title">
                        <img src="assets/default-profile-icon.jpg" className="avatar" />
                        <h2>{currentChat.name}</h2>
                        <Options />
                    </div>
                    <ChatWindow currentUserId={currentChat.id} messages={messages}/>
                </div>
            </div>
        </>
    )
}