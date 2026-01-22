import Sidebar from "../components/Sidebar"
import "./index.css";
import { getContacts, getMessages, getCurrentUser, createGrp, addMember } from "../services/chat";
import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import Options from "../components/Options";
import Profile from "../components/Profile";
import CreateGroupModal from "../components/CreateGroupModal";
import defaultAvatar from "../assets/default-profile-icon.jpg";

export default function Chat() {
    const [contacts, setContacts] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);

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
                                    onCreateGroup={() => { setShowCreateGroup(true) }}
                                    onViewProfile={() => { setShowProfile(true) }}
                                />
                            }
                            {showCreateGroup && <CreateGroupModal contacts={contacts} onClose={() => setShowCreateGroup(false)} onCreateGrp={createGroup} />}
                            {showProfile && <Profile user={currentUser} onClose={() => setShowProfile(false)} />}
                        </div>
                    )}
                    <ChatWindow currentUserId={currentUser?.id} messages={messages} />
                </div>
            </div>
        </>
    )
}